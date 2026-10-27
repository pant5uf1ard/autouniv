import { css, Tooltip, Typography } from "@mui/material";
import moment from "@/utils/momentKo";
import { useMemo } from "react";
import { AssignmentInfo } from "@/types";
import HelpIcon from "@mui/icons-material/Help";
import { flexBox } from "@/styles/mixin";
import { useTranslation } from "@/i18n";

interface EstimatedDurationProps {
  assignments: AssignmentInfo[];
  playrate: number;
}

function EstimatedDuration({ assignments, playrate }: EstimatedDurationProps) {
  const t = useTranslation();
  const estimatedDuration = useMemo(
    () =>
      moment.duration(
        assignments.reduce(
          (acc, assignment) => acc + (assignment?.commons_content?.duration ?? 0),
          0
        ) / playrate,
        "seconds"
      ),
    [playrate, assignments]
  );

  return (
    <div
      css={css`
        ${flexBox({ direction: "row", justify: "flex-start" })};
        gap: 0 5px;
      `}
    >
      <Tooltip title={t.lectures.durationHelp}>
        <HelpIcon sx={{ fontSize: "12pt", color: "#3c3c3ca0" }} />
      </Tooltip>
      <Typography variant="body2">
        {t.lectures.duration(estimatedDuration.hours(), estimatedDuration.minutes())}
      </Typography>
    </div>
  );
}

export default EstimatedDuration;
