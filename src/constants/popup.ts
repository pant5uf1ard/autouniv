import { ErrorInfo, Language, Route, SettingsInfo, SettingsType } from "@/types";
import ListIcon from "@mui/icons-material/List";
import SmartDisplayIcon from "@mui/icons-material/SmartDisplay";
import SettingsIcon from "@mui/icons-material/Settings";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";

const ROUTES: Route = {
  INDEX: {
    path: "/",
    Icon: ListIcon,
  },
  PLAYLIST: {
    path: "/playlist",
    Icon: SmartDisplayIcon,
  },
  MATERIALS: {
    path: "/materials",
    Icon: SimCardDownloadIcon,
  },
  SETTINGS: {
    path: "/settings",
    Icon: SettingsIcon,
  },
};

const SETTINGS_TYPE: { [key: string]: SettingsType } = {
  SELECT: "select",
  SWITCH: "switch",
  NUMBER: "number",
};

const LANGUAGES: { [key: string]: Language } = {
  KO: "ko",
  EN: "en",
};

const getDefaultLanguage = (): Language =>
  typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("ko")
    ? LANGUAGES.KO
    : LANGUAGES.EN;

// 설정 항목의 표시 이름은 src/i18n 에서 언어별로 관리
const SETTINGS: SettingsInfo = {
  DDAY: { defaultValue: false, type: SETTINGS_TYPE.SWITCH },
  WINDOW: {
    defaultValue: false,
    type: SETTINGS_TYPE.SWITCH,
  },
  CUSTOM_ASSIGNMENT: {
    defaultValue: false,
    type: SETTINGS_TYPE.SWITCH,
  },
  PLAYRATE: {
    defaultValue: "8",
    type: SETTINGS_TYPE.SELECT,
    options: [
      { name: "x0.5", value: "1" },
      { name: "x0.8", value: "2" },
      { name: "x1.0", value: "3" },
      { name: "x1.2", value: "4" },
      { name: "x1.4", value: "5" },
      { name: "x1.6", value: "6" },
      { name: "x1.8", value: "7" },
      { name: "x2.0", value: "8" },
    ],
  },
  LANGUAGE: {
    defaultValue: getDefaultLanguage(),
    type: SETTINGS_TYPE.SELECT,
    options: [
      { name: "한국어", value: "ko" },
      { name: "English", value: "en" },
    ],
  },
};

const PLAYRATE = [999999, 0.5, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0];

const ERRORS: ErrorInfo = {
  AUTH: {
    name: "Auth",
  },
  UNEXPECTED: {
    name: "Unexpected",
  },
};

const LIST_SKELETON_COUNT = 4;

export {
  ROUTES,
  LIST_SKELETON_COUNT,
  SETTINGS,
  SETTINGS_TYPE,
  ERRORS,
  PLAYRATE,
  LANGUAGES,
  getDefaultLanguage,
};
