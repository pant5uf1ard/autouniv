import AssignmentList from "@/popup/components/List/Assignment/AssignmentList";
import { useAssignmentAssessments } from "@/hooks/queries/useAssignmentAssessment";
import { useCourses, useAssignments, useMemoAssignments, useCustomAssignments } from "@/hooks";
import { useState, memo, useCallback } from "react";
import { playListAtom, selectedCourseIdsAtom, settingsAtom } from "@/atoms";
import { useSetAtom, useAtomValue } from "jotai";
import { useIsRestoring } from "@tanstack/react-query";
import produce from "immer";
import AuthFallback from "@/popup/components/Fallback/Auth/AuthFallback";
import isUnauthorizedError from "@/utils/isUnauthorizedError";
import { useTranslation } from "@/i18n";
import MainControl from "./MainControl/MainControl";

const MemoizedAssignmentList = memo(AssignmentList);

function Main() {
  // Atoms
  const selectedCourseIds = useAtomValue(selectedCourseIdsAtom);
  const settings = useAtomValue(settingsAtom);
  const setPlayList = useSetAtom(playListAtom);
  const t = useTranslation();

  // Queries
  const isRestoring = useIsRestoring();
  const { data: courses, error: coursesError } = useCourses();
  const courseIds = courses?.map((course) => course.id);
  const assignmentResults = useAssignments({
    courseIds,
    userId: courses?.[0]?.enrollments?.[0]?.user_id,
  });
  const assessmentResults = useAssignmentAssessments({ courseIds });
  const [assessmentAssignments, customAssignments] = useCustomAssignments({
    results: assessmentResults,
  });

  // Local hooks / states
  const [checkedAssignmentIdSet, setCheckedAssignmentIdSet] = useState<Set<number>>(new Set());
  const [isCheckable, setCheckable] = useState<boolean>(false);
  const { assignments, videoAssignments, workAssignments } = useMemoAssignments({
    results: assignmentResults,
    selectedCourseIds,
  });

  // handlers
  const handleCheckAssignment = useCallback(
    (id: number) =>
      setCheckedAssignmentIdSet((prev) =>
        produce(prev, (draft) => {
          if (prev.has(id)) draft.delete(id);
          else draft.add(id);
        })
      ),
    []
  );
  const handleConfirmSelect = () => {
    setPlayList(
      assignments.filter((assignment) => checkedAssignmentIdSet.has(assignment.assignment_id))
    );
    setCheckable(false);
  };
  const handleCancelSelect = () => {
    setCheckable(false);
    setCheckedAssignmentIdSet(new Set());
  };

  if (
    isUnauthorizedError(coursesError) ||
    assignmentResults.some((result) => isUnauthorizedError(result.error)) ||
    assessmentResults.some((result) => isUnauthorizedError(result.error))
  ) {
    return <AuthFallback />;
  }

  return (
    <>
      <MainControl
        isCheckable={isCheckable}
        setCheckable={setCheckable}
        videoAssignments={videoAssignments}
        assessmentAssignments={assessmentAssignments}
        checkedAssignmentIdSet={checkedAssignmentIdSet}
        onConfirmSelect={handleConfirmSelect}
        onCancelSelect={handleCancelSelect}
      />
      <MemoizedAssignmentList
        title={t.main.courses}
        isCheckable={isCheckable}
        isLoading={assignmentResults.some((result) => result.isLoading) || isRestoring}
        assignments={videoAssignments}
        courses={courses ?? []}
        checkedAssignmentIdSet={checkedAssignmentIdSet}
        onCheck={handleCheckAssignment}
        timeAsLeft={!!settings.DDAY}
      />
      <MemoizedAssignmentList
        title={t.main.homework}
        isLoading={assignmentResults.some((result) => result.isLoading) || isRestoring}
        assignments={workAssignments}
        courses={courses ?? []}
        timeAsLeft={!!settings.DDAY}
      />
      {settings.CUSTOM_ASSIGNMENT && (
        <MemoizedAssignmentList
          title={t.main.custom}
          isLoading={assessmentResults.some((result) => result.isLoading) || isRestoring}
          assignments={customAssignments}
          courses={courses ?? []}
          timeAsLeft={!!settings.DDAY}
        />
      )}
    </>
  );
}

export default Main;
