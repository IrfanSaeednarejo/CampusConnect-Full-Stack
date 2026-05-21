const CHAT_TYPES = ["chat_message", "message", "message_received"];
const TASK_TYPES = ["task_created", "task_reminder", "task_completed"];
const EVENT_TYPES = ["event_reminder", "event_update", "event_registration"];
const STUDY_GROUP_TYPES = ["studygroup_invite", "studygroup_update"];
const GAMIFICATION_TYPES = [
  "GAMIFICATION_POINTS",
  "GAMIFICATION_BADGE",
  "GAMIFICATION_LEVEL",
  "GAMIFICATION_STREAK",
  "GAMIFICATION_CERTIFICATE",
  "GAMIFICATION_LEADERBOARD",
];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasRoutePrefix(value) {
  return isNonEmptyString(value) && value.trim().startsWith("/");
}

function getValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function extractEntityId(notification) {
  return getValue(
    notification?.entityId,
    notification?.relatedId,
    notification?.metadata?.entityId,
    notification?.metadata?.relatedId,
    notification?.metadata?.taskId,
    notification?.metadata?.eventId,
    notification?.metadata?.societyId,
    notification?.metadata?.studyGroupId,
    notification?.metadata?.conversationId,
    notification?.metadata?.chatId,
    notification?.ref?._id,
    notification?.ref,
  );
}

function extractConversationId(notification) {
  return getValue(
    notification?.metadata?.conversationId,
    notification?.metadata?.chatId,
    notification?.conversationId,
    notification?.chatId,
    notification?.entityType === "Chat" ? extractEntityId(notification) : null,
    notification?.refModel === "Chat" ? extractEntityId(notification) : null,
  );
}

function extractUserId(notification) {
  return getValue(
    notification?.metadata?.userId,
    notification?.actorId?._id,
    notification?.actorId,
    notification?.refModel === "User" ? extractEntityId(notification) : null,
    notification?.refModel === "ProfileView" ? notification?.actorId?._id || notification?.actorId : null,
  );
}

export function getNotificationTarget(notification, options = {}) {
  const { isAdmin = false } = options;

  if (!notification) {
    return "/notifications";
  }

  if (hasRoutePrefix(notification.link)) {
    return notification.link.trim();
  }

  if (hasRoutePrefix(notification.metadata?.link)) {
    return notification.metadata.link.trim();
  }

  const type = notification.type || notification.entityType || "";
  const refModel = notification.refModel || notification.entityType || "";
  const entityId = extractEntityId(notification);
  const conversationId = extractConversationId(notification);
  const userId = extractUserId(notification);
  const adminText = `${notification?.title || ""} ${notification?.body || ""}`.toLowerCase();

  if (CHAT_TYPES.includes(type) || refModel === "Chat") {
    return conversationId ? `/messages/${conversationId}` : "/messages";
  }

  if (TASK_TYPES.includes(type) || refModel === "Task") {
    return "/tasks";
  }

  if (EVENT_TYPES.includes(type) || refModel === "Event") {
    return entityId ? `/events/${entityId}` : "/events";
  }

  if (type === "mentor_verified") {
    return "/mentor/dashboard";
  }

  if (type.startsWith("mentor_") || refModel === "MentorBooking") {
    return "/my-sessions";
  }

  if (STUDY_GROUP_TYPES.includes(type) || refModel === "StudyGroup") {
    return entityId ? `/study-groups/${entityId}` : "/study-groups";
  }

  if (type.startsWith("society_") || refModel === "Society") {
    return entityId ? `/societies/${entityId}` : "/societies";
  }

  if (type === "profile_view" || refModel === "ProfileView" || refModel === "User") {
    return userId ? `/users/${userId}` : "/profile/view";
  }

  if (GAMIFICATION_TYPES.includes(type) || refModel === "PointsTransaction" || refModel === "Badge") {
    return "/dashboard#rewards";
  }

  if (refModel === "NexusConversation") {
    return "/nexus";
  }

  if (type === "system" || type === "admin") {
    if (!isAdmin) {
      return "/notifications";
    }

    if (type === "system" || adminText.includes("maintenance") || adminText.includes("system")) {
      return "/admin/system";
    }

    if (refModel === "Event" || adminText.includes("event")) {
      return "/admin/events";
    }

    if (refModel === "Society" || adminText.includes("society")) {
      return "/admin/requests";
    }

    if (refModel === "StudyGroup" || adminText.includes("study group")) {
      return "/admin/requests";
    }

    if (adminText.includes("mentor")) {
      return "/admin/mentors";
    }

    if (refModel === "User" || adminText.includes("user")) {
      return "/admin/users";
    }

    return "/admin/notifications";
  }

  return "/notifications";
}
