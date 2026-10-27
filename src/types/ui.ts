import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";

interface Route {
  [key: string]: {
    path: string;
    Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string };
  };
}

type SettingsKey = "DDAY" | "WINDOW" | "PLAYRATE" | "CUSTOM_ASSIGNMENT" | "LANGUAGE";
type Language = "ko" | "en";
type SettingsType = "switch" | "number" | "select";
type Settings = {
  [key in SettingsKey]: boolean | string;
};
interface SettingsItemInfo {
  defaultValue: boolean | string;
  type: SettingsType;
  options?: { name: string; value: string }[];
}
type SettingsInfo = {
  [key in SettingsKey]: SettingsItemInfo;
};

type ErrorKey = "AUTH" | "UNEXPECTED";
type ErrorInfo = {
  [key in ErrorKey]: {
    name: string;
  };
};

export type {
  Route,
  SettingsKey,
  Language,
  SettingsType,
  Settings,
  SettingsInfo,
  SettingsItemInfo,
  ErrorKey,
  ErrorInfo,
};
