import React from "react";

// Simple placeholder for ModerationSidebar, delegates to ModerationSidebarV2 for now
import ModerationSidebarV2 from "./ModerationSidebarV2";

export default function ModerationSidebar(props) {
  // Pass all props to V2 for compatibility
  return <ModerationSidebarV2 {...props} />;
}
