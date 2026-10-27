import { useEffect } from "react";
import { AssignmentInfo } from "@/types";
import { useTranslation } from "@/i18n";

interface PlayerProps {
  assignment: AssignmentInfo;
  studentId: string;
}

export function buildPlayerSrc(assignment: AssignmentInfo, studentId: string): string {
  const contentId = assignment.commons_content?.content_id ?? assignment.content_id ?? "";
  const duration = assignment.commons_content?.duration ?? assignment.duration ?? 0;
  const contentType =
    assignment.commons_content?.content_type ?? assignment.content_type ?? "movie";
  const sectionId = assignment.section_id ?? 0;

  const targetUrl = encodeURIComponent(
    `https://canvas.skku.edu/learningx/api/v1/courses/${assignment.course_id}/sections/${sectionId}/components/${assignment.component_id}/progress?user_id=${studentId}&content_id=${contentId}&content_type=${contentType}`
  );

  return `https://lcms.skku.edu/em/${contentId}?startat=0.00&endat=${duration}&TargetUrl=${targetUrl}&sl=1&pr=1&mxpr=2.00&lg=ko`;
}

function Player({ assignment, studentId }: PlayerProps) {
  const t = useTranslation();

  useEffect(() => {
    if (!studentId) return;

    const src = buildPlayerSrc(assignment, studentId);

    chrome.storage.local.get(["autouniv_playing_src"], (result) => {
      if (result.autouniv_playing_src === src) return;

      chrome.runtime.sendMessage({
        type: "AUTOUNIV_PLAY",
        src,
        idx: 0,
      });
    });
  }, [assignment, studentId]);

  return (
    <div
      style={{
        width: "100%",
        height: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a1a",
        color: "#aaa",
        fontSize: "13px",
        borderRadius: "4px",
      }}
    >
      {t.lectures.playing}
    </div>
  );
}

export default Player;
