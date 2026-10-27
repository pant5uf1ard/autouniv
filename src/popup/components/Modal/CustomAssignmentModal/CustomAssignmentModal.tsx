import { DialogTitle, DialogContent, DialogActions, Button, Tooltip } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import CheckableSublist from "@/popup/components/List/CheckableSublist/CheckableSublist";
import { AssignmentShortInfo, Course } from "@/types";
import { useState } from "react";
import { useTranslation } from "@/i18n";

import * as S from "./CustomAssignmentModal.style";

interface CustomAssignmentModalProps {
  assignments: AssignmentShortInfo[][];
  addedAssignmentIds: number[];
  courses: Course[];
  onConfirm: (checked: Set<number>) => void;
  onClose: () => void;
}

function CustomAssignmentModal({
  assignments,
  courses,
  onConfirm,
  onClose,
  addedAssignmentIds,
}: CustomAssignmentModalProps) {
  const t = useTranslation();
  const [checkedUnlisted, setCheckedUnlisted] = useState<Set<number>>(new Set());
  const [checkedListed, setCheckedListed] = useState<Set<number>>(new Set());
  const [listedAssignmentIds, setListedAssignmentIds] = useState<number[]>(addedAssignmentIds);

  const handleAddToListed = () => {
    setListedAssignmentIds((prev) => [...prev, ...checkedUnlisted]);
    setCheckedUnlisted(new Set());
  };
  const handleRemoveFromListed = () => {
    setListedAssignmentIds((prev) => prev.filter((id) => !checkedListed.has(id)));
    setCheckedListed(new Set());
  };
  const handleConfirm = () => onConfirm(new Set(listedAssignmentIds));

  return (
    <>
      <DialogTitle>
        {t.modal.title}
        <Tooltip sx={{ fontSize: "12pt", marginLeft: "10px" }} title={t.modal.help}>
          <HelpIcon />
        </Tooltip>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <S.SublistContainer variant="outlined">
          {assignments.map((assignmentsOfCourse) => {
            const filteredAssignmentsOfCourse = assignmentsOfCourse.filter(
              (assignment) => !listedAssignmentIds.includes(assignment.assignment_id)
            );
            return (
              filteredAssignmentsOfCourse.length > 0 && (
                <CheckableSublist
                  key={filteredAssignmentsOfCourse[0].course_id ?? 0}
                  assignments={filteredAssignmentsOfCourse}
                  checked={checkedUnlisted}
                  courses={courses}
                  onCheck={setCheckedUnlisted}
                />
              )
            );
          })}
        </S.SublistContainer>
        <S.ButtonGroup>
          <Button onClick={handleRemoveFromListed} variant="outlined">
            {t.modal.up}
          </Button>
          <Button onClick={handleAddToListed} variant="outlined">
            {t.modal.down}
          </Button>
        </S.ButtonGroup>
        <S.SublistContainer variant="outlined">
          {assignments.map((assignmentsOfCourse) => {
            const filteredAssignmentsOfCourse = assignmentsOfCourse.filter((assignment) =>
              listedAssignmentIds.includes(assignment.assignment_id)
            );
            return (
              filteredAssignmentsOfCourse.length > 0 && (
                <CheckableSublist
                  key={filteredAssignmentsOfCourse[0].course_id ?? 0}
                  assignments={filteredAssignmentsOfCourse}
                  checked={checkedListed}
                  courses={courses}
                  onCheck={setCheckedListed}
                />
              )
            );
          })}
        </S.SublistContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="info">
          {t.modal.cancel}
        </Button>
        <Button onClick={handleConfirm} color="primary">
          {t.modal.confirm}
        </Button>
      </DialogActions>
    </>
  );
}

export default CustomAssignmentModal;
