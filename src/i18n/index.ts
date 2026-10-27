import { useAtomValue } from "jotai";
import { settingsAtom } from "@/atoms";
import { LANGUAGES, getDefaultLanguage } from "@/constants";
import { Language, SettingsKey } from "@/types";

const ko = {
  settings: {
    DDAY: "기한을 남은 시간으로 표기",
    WINDOW: "확장을 새 탭 대신 창으로 열기",
    CUSTOM_ASSIGNMENT: "사용자 추가 과제 사용",
    PLAYRATE: "재생 속도 변경",
    LANGUAGE: "언어 (Language)",
  } as { [key in SettingsKey]: string },
  errors: {
    AUTH: "아이캠퍼스 로그인이 필요합니다.",
    UNEXPECTED: "예상하지 못한 에러가 발생했습니다.",
  },
  auth: {
    login: "새 탭에서 로그인 하기",
    retry: "로그인 상태 다시 확인",
  },
  main: {
    courses: "강의",
    homework: "과제",
    custom: "사용자 추가 과제",
    blank: "야호! 다 끝냈어요!",
  },
  control: {
    dropdownLabel: "표시할 과목",
    customAssignment: "사용자 추가 과제 선택",
    openTab: "새 탭에서 열기",
    openWindow: "새 창에서 열기",
    cancel: "선택 취소",
    confirm: "재생목록에 추가",
    addPlaylist: "재생목록 선택",
    update: "강의 데이터 업데이트",
  },
  modal: {
    help: `상단에는 '과제 및 평가' 탭에서 제공하는 과제 리스트를 표시합니다.
과제 리스트에서 과제를 선택하여 추가하면 하단에 옮겨집니다.`,
    title: "사용자 추가 과제 선택",
    cancel: "취소",
    confirm: "선택 완료",
    up: "삭제 ⮝",
    down: "⮟ 추가",
  },
  lectures: {
    blank: "재생할 영상이 없어요..",
    playing: "Canvas 탭에서 재생 중...",
    durationHelp: "배속이 적용된 시간입니다. 전체 영상 길이로 계산하므로, 부정확할 수 있습니다.",
    duration: (hours: number, minutes: number) => `예상 소요시간 : ${hours}시간 ${minutes}분`,
  },
  materials: {
    subheader: "강의 교안 및 PDF 목록",
    download: "다운로드",
  },
  settingsSection: {
    subheader: "설정",
    saved: "설정이 저장되었습니다.",
    save: "설정 저장",
    infos: "정보",
    version: "버전",
    report: "버그 제보 및 기능 제안",
  },
  update: {
    message: "새로운 버전으로 업데이트 되었습니다. —",
    changes: "변경 사항 보기",
  },
};

type Messages = typeof ko;

const en: Messages = {
  settings: {
    DDAY: "Show deadlines as time remaining",
    WINDOW: "Open extension in a window instead of a tab",
    CUSTOM_ASSIGNMENT: "Enable custom assignments",
    PLAYRATE: "Playback speed",
    LANGUAGE: "Language (언어)",
  },
  errors: {
    AUTH: "Please log in to iCampus.",
    UNEXPECTED: "An unexpected error occurred.",
  },
  auth: {
    login: "Log in in a new tab",
    retry: "Check login status again",
  },
  main: {
    courses: "Lectures",
    homework: "Assignments",
    custom: "Custom assignments",
    blank: "Hooray! All done!",
  },
  control: {
    dropdownLabel: "Courses to show",
    customAssignment: "Select custom assignments",
    openTab: "Open in new tab",
    openWindow: "Open in new window",
    cancel: "Cancel selection",
    confirm: "Add to playlist",
    addPlaylist: "Select for playlist",
    update: "Refresh lecture data",
  },
  modal: {
    help: `The top list shows assignments from the 'Assignments & Assessments' tab.
Select assignments there and add them to move them to the bottom list.`,
    title: "Select custom assignments",
    cancel: "Cancel",
    confirm: "Done",
    up: "Remove ⮝",
    down: "⮟ Add",
  },
  lectures: {
    blank: "No videos to play..",
    playing: "Playing in the Canvas tab...",
    durationHelp:
      "Adjusted for playback speed. Based on full video length, so it may be inaccurate.",
    duration: (hours: number, minutes: number) => `Estimated time: ${hours}h ${minutes}m`,
  },
  materials: {
    subheader: "Lecture slides & PDFs",
    download: "Download",
  },
  settingsSection: {
    subheader: "Settings",
    saved: "Settings saved.",
    save: "Save settings",
    infos: "Info",
    version: "Version",
    report: "Report a bug / request a feature",
  },
  update: {
    message: "Updated to a new version. —",
    changes: "See what's new",
  },
};

const MESSAGES: { [key in Language]: Messages } = { ko, en };

const toLanguage = (value: unknown): Language =>
  Object.values(LANGUAGES).includes(value as Language) ? (value as Language) : getDefaultLanguage();

function useLanguage(): Language {
  const settings = useAtomValue(settingsAtom);
  return toLanguage(settings.LANGUAGE);
}

function useTranslation(): Messages {
  return MESSAGES[useLanguage()];
}

export { MESSAGES, toLanguage, useLanguage, useTranslation };
export type { Messages };
