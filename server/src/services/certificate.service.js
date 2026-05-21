import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { Certificate } from "../models/certificate.model.js";
import { Event } from "../models/event.model.js";
import { EventScore } from "../models/eventScore.model.js";
import { EventSubmission } from "../models/eventsSubmission.model.js";
import { EventTeam } from "../models/eventTeam.model.js";
import { User } from "../models/user.model.js";
import { emitToUser } from "../sockets/index.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import { updateUserGamificationSummary, createGamificationNotification } from "./gamification.service.js";

const buildVerificationUrl = (code) => {
    const baseUrl =
        process.env.CLIENT_URL ||
        process.env.PUBLIC_APP_URL ||
        "http://localhost:5173";

    return `${baseUrl.replace(/\/+$/, "")}/verify-certificate/${code}`;
};

export const generateVerificationCode = async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
        const code = crypto.randomBytes(12).toString("hex").toUpperCase();
        const exists = await Certificate.exists({ verificationCode: code });
        if (!exists) return code;
    }
    throw new Error("Failed to generate a unique certificate verification code");
};

const buildCertificateRecipientName = (user) =>
    user?.profile?.displayName ||
    [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(" ") ||
    "CampusNexus User";

const resolveEventParticipationRole = async (event, userId) => {
    const userIdStr = userId.toString();
    const registration = event.registrations.find((item) => item.userId.toString() === userIdStr);
    if (registration?.status === "attended") {
        return {
            eligible: true,
            roleLabel: "Participant",
            reason: "Verified attendance found",
        };
    }

    return {
        eligible: false,
        reason: "Verified event attendance is required before issuing this certificate",
    };
};

const resolveCompetitionParticipantRole = async (event, userId) => {
    const userIdStr = userId.toString();
    const team = await EventTeam.findOne({
        eventId: event._id,
        "members.userId": userId,
        status: { $in: ["forming", "registered"] },
    }).select("_id teamName members");

    if (team) {
        const submission = await EventSubmission.findOne({
            eventId: event._id,
            teamId: team._id,
            status: { $in: ["submitted", "reviewed"] },
        }).select("_id");

        if (submission) {
            return {
                eligible: true,
                roleLabel: "Participant",
                reason: `Valid team participation found for ${team.teamName}`,
                meta: { teamId: team._id, teamName: team.teamName, submissionId: submission._id },
            };
        }
    }

    const soloSubmission = await EventSubmission.findOne({
        eventId: event._id,
        userId,
        status: { $in: ["submitted", "reviewed"] },
    }).select("_id");

    if (soloSubmission) {
        return {
            eligible: true,
            roleLabel: "Participant",
            reason: "Valid solo submission found",
            meta: { submissionId: soloSubmission._id },
        };
    }

    return {
        eligible: false,
        reason: "A valid competition submission or team participation is required",
    };
};

const resolveCompetitionWinnerRole = async (event, userId) => {
    if (!event.scoringPublished) {
        return {
            eligible: false,
            reason: "Leaderboard must be published before winner certificates can be issued",
        };
    }

    const leaderboard = await EventScore.generateLeaderboard(event._id);
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
        return {
            eligible: false,
            reason: "No published leaderboard entries found for this competition",
        };
    }

    const winningEntry = leaderboard.find((entry) => {
        const directUserId = entry.user?._id?.toString?.();
        if (directUserId && directUserId === userId.toString()) return true;

        const teamId = entry.team?._id;
        if (!teamId) return false;
        return false;
    });

    if (winningEntry?.user?._id?.toString?.() === userId.toString()) {
        return {
            eligible: true,
            roleLabel: "Winner",
            reason: "User appears in the published competition leaderboard",
            meta: { rank: leaderboard.indexOf(winningEntry) + 1, submissionId: winningEntry.submissionId },
        };
    }

    const winningTeamIds = leaderboard
        .slice(0, Math.max(1, event.prizePool?.length || 1))
        .map((entry) => entry.team?._id)
        .filter(Boolean);

    if (winningTeamIds.length > 0) {
        const team = await EventTeam.findOne({
            _id: { $in: winningTeamIds },
            "members.userId": userId,
        }).select("_id teamName");

        if (team) {
            const rank = leaderboard.findIndex((entry) => entry.team?._id?.toString?.() === team._id.toString()) + 1;
            return {
                eligible: true,
                roleLabel: "Winner",
                reason: `User belongs to ranked team ${team.teamName}`,
                meta: { rank, teamId: team._id, teamName: team.teamName },
            };
        }
    }

    return {
        eligible: false,
        reason: "User is not in the published winner set for this competition",
    };
};

const validateEligibility = async ({ userId, sourceModel, sourceId, type, meta = {} }) => {
    if (sourceModel !== "Event") {
        return { eligible: true, meta };
    }

    const event = await Event.findById(sourceId).select("title isOnlineCompetition registrations scoringPublished prizePool");
    if (!event) throw new Error("Source event not found");

    if (type === "event_attendance" || meta.kind === "event_attendance") {
        const result = await resolveEventParticipationRole(event, userId);
        return {
            ...result,
            eventTitle: event.title,
            meta: { ...meta, roleLabel: result.roleLabel || meta.roleLabel },
        };
    }

    if (type === "competition_participation" || meta.kind === "competition_participation") {
        const result = await resolveCompetitionParticipantRole(event, userId);
        return {
            ...result,
            eventTitle: event.title,
            meta: { ...meta, ...result.meta, roleLabel: result.roleLabel || meta.roleLabel },
        };
    }

    if (type === "competition_winner" || meta.kind === "competition_winner") {
        const result = await resolveCompetitionWinnerRole(event, userId);
        return {
            ...result,
            eventTitle: event.title,
            meta: { ...meta, ...result.meta, roleLabel: result.roleLabel || meta.roleLabel },
        };
    }

    return { eligible: true, eventTitle: event.title, meta };
};

const makeTempFilePath = (extension) =>
    path.join(os.tmpdir(), `campusnexus-certificate-${Date.now()}-${crypto.randomUUID()}.${extension}`);

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

const writePdfToDisk = async ({ certificate, user, verificationUrl, qrDataUrl }) =>
    await new Promise((resolve, reject) => {
        const tempPath = makeTempFilePath("pdf");
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(tempPath);

        doc.pipe(stream);

        doc.rect(20, 20, 555, 802).lineWidth(2).stroke("#D4AF37");
        doc.fontSize(28).fillColor("#162033").text("CampusNexus Certificate", { align: "center" });
        doc.moveDown(0.5);
        doc.fontSize(14).fillColor("#526277").text("This certifies that", { align: "center" });
        doc.moveDown(0.5);
        doc.fontSize(24).fillColor("#0F172A").text(buildCertificateRecipientName(user), {
            align: "center",
            underline: true,
        });
        doc.moveDown(1);
        doc.fontSize(16).fillColor("#334155").text(certificate.title, { align: "center" });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor("#526277").text(`Issued on ${formatDate(certificate.issuedAt)}`, { align: "center" });
        doc.moveDown(0.5);
        doc.text(`Verification Code: ${certificate.verificationCode}`, { align: "center" });
        doc.moveDown(1.5);

        if (certificate.meta?.eventTitle) {
            doc.fontSize(12).fillColor("#334155").text(`Source Event: ${certificate.meta.eventTitle}`, { align: "center" });
        }
        if (certificate.meta?.roleLabel) {
            doc.text(`Recognition: ${certificate.meta.roleLabel}`, { align: "center" });
        }
        if (certificate.meta?.rank) {
            doc.text(`Rank: #${certificate.meta.rank}`, { align: "center" });
        }

        const qrBase64 = qrDataUrl.split(",")[1];
        const qrBuffer = Buffer.from(qrBase64, "base64");
        doc.image(qrBuffer, 220, 500, { fit: [160, 160], align: "center" });
        doc.fontSize(10).fillColor("#64748B").text("Scan to verify", 0, 668, { align: "center" });
        doc.moveDown(0.2);
        doc.text(verificationUrl, { align: "center", width: 500 });

        doc.end();

        stream.on("finish", () => resolve(tempPath));
        stream.on("error", reject);
        doc.on("error", reject);
    });

export const generateCertificatePdf = async ({ certificate, user }) => {
    const verificationUrl = buildVerificationUrl(certificate.verificationCode);
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        margin: 1,
        width: 400,
        color: { dark: "#162033", light: "#FFFFFF" },
    });

    const pdfPath = await writePdfToDisk({ certificate, user, verificationUrl, qrDataUrl });

    return {
        pdfPath,
        verificationUrl,
        qrDataUrl,
        fileName: `${certificate.type || "certificate"}-${certificate.verificationCode}.pdf`,
    };
};

export const uploadCertificateToCloudinary = async ({ pdfPath, qrDataUrl, certificate }) => {
    try {
        const [pdfUpload, qrUpload] = await Promise.all([
            uploadOnCloudinary(pdfPath, {
                folder: "campusnexus/certificates",
                resource_type: "raw",
                public_id: `certificate-${certificate.verificationCode}`,
                overwrite: true,
            }),
            uploadOnCloudinary(qrDataUrl, {
                folder: "campusnexus/certificates/qr",
                resource_type: "image",
                public_id: `certificate-qr-${certificate.verificationCode}`,
                overwrite: true,
            }),
        ]);

        return {
            pdfUrl: pdfUpload?.secure_url || "",
            cloudinaryPublicId: pdfUpload?.public_id || "",
            qrUrl: qrUpload?.secure_url || "",
            qrPublicId: qrUpload?.public_id || "",
        };
    } catch (error) {
        console.error("[Certificate] Cloudinary upload failed:", error.message);
        return { pdfUrl: "", cloudinaryPublicId: "", qrUrl: "", qrPublicId: "" };
    } finally {
        if (pdfPath && fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }
    }
};

export const issueCertificate = async ({ userId, sourceModel, sourceId, type, title, issuedBy, meta = {} }) => {
    const user = await User.findById(userId).select("campusId profile.displayName profile.firstName profile.lastName");
    if (!user) throw new Error("User not found");

    const eligibility = await validateEligibility({ userId, sourceModel, sourceId, type, meta });
    if (eligibility.eligible === false) {
        throw new Error(eligibility.reason || "Certificate eligibility requirements were not met");
    }

    const existing = await Certificate.findOne({
        userId,
        sourceModel,
        sourceId,
        type,
        status: "issued",
    });
    if (existing) return existing;

    const verificationCode = await generateVerificationCode();
    const certificate = await Certificate.create({
        userId,
        campusId: user.campusId || null,
        type,
        sourceModel,
        sourceId,
        title,
        issuedBy: issuedBy || null,
        issuedAt: new Date(),
        verificationCode,
        qrUrl: "",
        pdfUrl: "",
        cloudinaryPublicId: "",
        status: "issued",
        meta: {
            ...meta,
            ...eligibility.meta,
            verificationUrl: buildVerificationUrl(verificationCode),
        },
    });

    try {
        const pdfResult = await generateCertificatePdf({ certificate, user });
        const uploadResult = await uploadCertificateToCloudinary({
            pdfPath: pdfResult.pdfPath,
            qrDataUrl: pdfResult.qrDataUrl,
            certificate,
        });

        certificate.pdfUrl = uploadResult.pdfUrl;
        certificate.cloudinaryPublicId = uploadResult.cloudinaryPublicId;
        certificate.qrUrl = uploadResult.qrUrl || pdfResult.verificationUrl;
        certificate.meta = {
            ...(certificate.meta || {}),
            verificationUrl: pdfResult.verificationUrl,
            qrPublicId: uploadResult.qrPublicId || "",
        };
        await certificate.save();
    } catch (error) {
        console.error("[Certificate] PDF/QR generation failed:", error.message);
        certificate.qrUrl = certificate.meta?.verificationUrl || buildVerificationUrl(certificate.verificationCode);
        await certificate.save();
    }

    await updateUserGamificationSummary(userId);

    const payload = {
        userId: userId.toString(),
        certificateId: certificate._id.toString(),
        title: certificate.title,
        verificationCode: certificate.verificationCode,
        pdfUrl: certificate.pdfUrl,
    };

    emitToUser(userId.toString(), "gamification:certificate-issued", payload);
    createGamificationNotification({
        userId,
        type: "GAMIFICATION_CERTIFICATE",
        title: "Certificate issued",
        body: `Your certificate "${certificate.title}" is now available.`,
        ref: certificate._id,
        refModel: "Certificate",
        actorId: issuedBy || null,
        priority: "high",
    });

    return certificate;
};

export const verifyCertificate = async (code) => {
    const certificate = await Certificate.findOne({
        verificationCode: String(code || "").trim().toUpperCase(),
        status: "issued",
    })
        .populate("userId", "profile.displayName profile.firstName profile.lastName")
        .populate("issuedBy", "profile.displayName");

    if (!certificate) return null;

    return {
        _id: certificate._id,
        title: certificate.title,
        type: certificate.type,
        verificationCode: certificate.verificationCode,
        issuedAt: certificate.issuedAt,
        status: certificate.status,
        recipient: {
            displayName: buildCertificateRecipientName(certificate.userId),
        },
        sourceModel: certificate.sourceModel,
        pdfUrl: certificate.pdfUrl,
        qrUrl: certificate.qrUrl,
        verificationUrl: certificate.meta?.verificationUrl || buildVerificationUrl(certificate.verificationCode),
        meta: {
            eventTitle: certificate.meta?.eventTitle,
            roleLabel: certificate.meta?.roleLabel,
            rank: certificate.meta?.rank,
        },
    };
};

export const getUserCertificates = async (userId) => {
    return await Certificate.find({ userId, status: "issued" }).sort({ issuedAt: -1 }).lean();
};
