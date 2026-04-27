import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Lock, Mail, LogOut } from "lucide-react";

const SuspendedPage = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5 font-display">
            <div className="max-w-[600px] w-full bg-slate-900 rounded-[24px] border border-slate-800 p-8 md:p-12 text-center shadow-2xl animate-in fade-in zoom-in duration-500">

                {/* Icon Header */}
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                    <Lock className="w-10 h-10 text-rose-500" />
                </div>

                <h1 className="text-slate-50 text-3xl font-extrabold mb-4 tracking-tight">
                    Account Restricted
                </h1>

                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    Your system access has been temporarily suspended by an administrator for policy violations or governance review.
                </p>

                {/* Reason Card */}
                <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800 text-left mb-8">
                    <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.14em] mb-3">
                        OFFICIAL REASON
                    </h3>
                    <p className="text-slate-200 text-base font-medium italic leading-snug">
                        "{user?.suspendReason || "No specific reason provided by administration."}"
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <a
                        href={`mailto:support@campusnexus.com?subject=Appeal Suspension for User ${user?.email}`}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-4 px-6 rounded-xl font-bold text-base transition-all active:scale-[0.98]"
                    >
                        <Mail className="w-5 h-5" />
                        REQUEST REINSTATEMENT
                    </a>

                    <Link
                        to="/logout"
                        className="group flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 font-semibold text-sm mt-3 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Link>
                </div>

                {/* Footer Metadata */}
                <div className="mt-10 pt-6 border-t border-slate-800">
                    <p className="text-slate-600 text-xs font-medium">
                        Reference ID: <span className="font-mono text-slate-500">{user?._id}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuspendedPage;
