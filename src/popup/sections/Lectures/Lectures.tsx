import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { playListAtom, settingsAtom } from "@/atoms";
import Player, { buildPlayerSrc } from "@/popup/components/Player/Player";
import { useCourses, useStudentId } from "@/hooks";
import PlayList from "@/popup/components/List/Playlist/Playlist";
import { Typography } from "@mui/material";
import useChromeMessageHandler from "@/hooks/useChromeMessageHandler";
import { PLAYRATE } from "@/constants";
import EstimatedDuration from "@/popup/components/EstimatedDuration/EstimatedDuration";
import AuthFallback from "@/popup/components/Fallback/Auth/AuthFallback";
import isUnauthorizedError from "@/utils/isUnauthorizedError";
import { useTranslation } from "@/i18n";
import * as S from "./Lectures.style";

function Lectures() {
  const settings = useAtomValue(settingsAtom);
  const playList = useAtomValue(playListAtom);
  const { data: courses, error: coursesError } = useCourses({});
  const { data: studentId, error: studentIdError } = useStudentId({
    courseId: courses?.[0].id,
    userId: courses?.[0].enrollments[0].user_id,
  });
  useChromeMessageHandler();
  const t = useTranslation();

  // 플레이리스트가 바뀌면 background worker가 사용할 src 목록 저장
  useEffect(() => {
    if (!studentId || playList.length === 0) return;
    const srcs = playList.map((a) => buildPlayerSrc(a, studentId));
    chrome.storage.local.set({ autouniv_playlist: srcs });
  }, [playList, studentId]);

  if (isUnauthorizedError(coursesError) || isUnauthorizedError(studentIdError)) {
    return <AuthFallback />;
  }

  return (
    <>
      {playList.length > 0 ? (
        <>
          <EstimatedDuration assignments={playList} playrate={PLAYRATE[+settings.PLAYRATE]} />
          <Player assignment={playList[0]} studentId={studentId ?? ""} />
        </>
      ) : (
        <S.BlankPlayList>
          <Typography variant="h5">{t.lectures.blank}</Typography>
        </S.BlankPlayList>
      )}

      <PlayList assignments={playList} courses={courses ?? []} />
    </>
  );
}

export default Lectures;
