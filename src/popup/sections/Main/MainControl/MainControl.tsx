import { useCourses, useAssignments } from "@/hooks";
import { Dispatch, SetStateAction } from "react";
import {
  customAssignmentIdsAtom,
  modalCloseAtom,
  modalOpenAtom,
  selectedCourseIdsAtom,
  settingsAtom,
} from "@/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import { css } from "@emotion/react";
import { IconButton, Tooltip } from "@mui/material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import CachedIcon from "@mui/icons-material/Cached";
import SelectCheck from "@/popup/components/SelectCheck/SelectCheck";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import TabIcon from "@mui/icons-material/Tab";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EstimatedDuration from "@/popup/components/EstimatedDuration/EstimatedDuration";
import CustomAssignmentModal from "@/popup/components/Modal/CustomAssignmentModal/CustomAssignmentModal";
import { PLAYRATE } from "@/constants";
import { AssignmentInfo, AssignmentShortInfo } from "@/types";
import { useTranslation } from "@/i18n";
import * as S from "./MainControl.style";

const POPUP_URL = "popup.html";
const WINDOW_HEIGHT = 600;
const WINDOW_WIDTH = 510;

interface MainControlProps {
  isCheckable: boolean;
  setCheckable: Dispatch<SetStateAction<boolean>>;
  videoAssignments: AssignmentInfo[];
  assessmentAssignments: AssignmentShortInfo[][];
  checkedAssignmentIdSet: Set<number>;
  onConfirmSelect: () => void;
  onCancelSelect: () => void;
}

function MainControl({
  isCheckable,
  setCheckable,
  checkedAssignmentIdSet,
  videoAssignments,
  assessmentAssignments,
  onConfirmSelect,
  onCancelSelect,
}: MainControlProps) {
  // atoms
  const [selectedCourseIds, setselectedCourseIds] = useAtom(selectedCourseIdsAtom);
  const settings = useAtomValue(settingsAtom);
  const openModal = useSetAtom(modalOpenAtom);
  const closeModal = useSetAtom(modalCloseAtom);
  const [customAssignments, setCustomAssignments] = useAtom(customAssignmentIdsAtom);
  const t = useTranslation();

  // queries
  const isRestoring = useIsRestoring();
  const queryClient = useQueryClient();
  const { data: courses } = useCourses();
  const results = useAssignments({
    courseIds: courses?.map((course) => course.id),
    userId: courses?.[0].enrollments[0].user_id,
  });

  // handlers
  const handleChange = (ids: number[]) => setselectedCourseIds([...ids]);
  const handleClickAddPlaylist = () => setCheckable(true);
  const handleOpenTab = () => {
    if (settings.WINDOW)
      chrome.windows.create({
        url: POPUP_URL,
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        type: "panel",
      });
    else chrome.tabs.create({ url: POPUP_URL });
  };
  const handleModalConfirm = (checked: Set<number>) => {
    setCustomAssignments([...checked]);
    closeModal();
  };
  const handleModalOpen = () =>
    openModal({
      modalBody: (
        <CustomAssignmentModal
          assignments={assessmentAssignments}
          courses={courses ?? []}
          addedAssignmentIds={customAssignments}
          onConfirm={handleModalConfirm}
          onClose={closeModal}
        />
      ),
    });

  const checkedAssignments = videoAssignments.filter((assignment) =>
    checkedAssignmentIdSet.has(assignment.id ?? 0)
  );

  return (
    <S.ControlWrapper>
      <SelectCheck
        label={t.control.dropdownLabel}
        courses={courses ?? []}
        onChange={handleChange}
        selected={selectedCourseIds}
        isLoading={isRestoring}
      />
      <Tooltip title={t.control.customAssignment}>
        <IconButton onClick={handleModalOpen}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <div
        css={css`
          margin-left: auto;
        `}
      />

      {isCheckable && (
        <EstimatedDuration
          assignments={checkedAssignments}
          playrate={PLAYRATE[+settings.PLAYRATE]}
        />
      )}
      <Tooltip title={settings.WINDOW ? t.control.openWindow : t.control.openTab}>
        <IconButton onClick={handleOpenTab}>
          <TabIcon />
        </IconButton>
      </Tooltip>
      {isCheckable ? (
        <>
          <Tooltip title={t.control.cancel}>
            <IconButton onClick={onCancelSelect}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t.control.confirm}>
            <IconButton onClick={onConfirmSelect}>
              <CheckIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <>
          <Tooltip title={t.control.update}>
            <IconButton onClick={() => queryClient.invalidateQueries()}>
              <CachedIcon
                css={css`
                  ${results.some((result) => result.isFetching) && S.spin};
                `}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title={t.control.addPlaylist}>
            <IconButton onClick={handleClickAddPlaylist}>
              <PlaylistAddIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </S.ControlWrapper>
  );
}

export default MainControl;
