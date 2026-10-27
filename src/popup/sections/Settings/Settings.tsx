import { settingsAtom, snackbarOpenAtom, versionAtom } from "@/atoms";
import { SETTINGS } from "@/constants";
import { SettingsKey, Settings } from "@/types";
import { MESSAGES, toLanguage, useTranslation } from "@/i18n";
import SettingsItem from "@/popup/components/SettingsItem/SettingsItem";
import { List, ListSubheader, ListItem, ListItemText, Button, Divider } from "@mui/material";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { useState } from "react";
import * as S from "./Settings.style";

function SettingsSection() {
  const version = useAtomValue(versionAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
  const [temporalSettings, setTemporalSettings] = useState<Settings>(settings);
  const openSnackbar = useSetAtom(snackbarOpenAtom);
  const t = useTranslation();

  const handleChange = (key: SettingsKey, value: boolean | string) => {
    setTemporalSettings((prev) => ({ ...prev, [key]: value }));
  };
  const handleSubmit = () => {
    setSettings(temporalSettings);
    // 언어를 바꾼 경우 새 언어로 저장 완료 메시지 표시
    openSnackbar({
      message: MESSAGES[toLanguage(temporalSettings.LANGUAGE)].settingsSection.saved,
    });
  };
  const handleOpenReport = () => {
    chrome.tabs.create({ url: "https://github.com/again7536/icampus-manager/issues" });
  };

  return (
    <>
      <List
        sx={{ width: "100%", bgcolor: "background.paper" }}
        subheader={<ListSubheader>{t.settingsSection.subheader}</ListSubheader>}
      >
        {Object.entries(SETTINGS).map(([key, val]) => (
          <SettingsItem
            key={key}
            listKey={key as SettingsKey}
            onChange={handleChange}
            setting={val}
            temporalSetting={temporalSettings[key as SettingsKey]}
          />
        ))}
      </List>
      <S.ButtonGroup>
        <Button onClick={handleSubmit} variant="contained">
          {t.settingsSection.save}
        </Button>
      </S.ButtonGroup>

      <Divider />

      <List
        sx={{ width: "100%", bgcolor: "background.paper" }}
        subheader={<ListSubheader>{t.settingsSection.infos}</ListSubheader>}
        dense
      >
        <ListItem>
          <ListItemText primary={t.settingsSection.version} secondary={version} />
        </ListItem>
      </List>
      <S.ButtonGroup>
        <Button onClick={handleOpenReport} variant="outlined">
          {t.settingsSection.report}
        </Button>
      </S.ButtonGroup>
    </>
  );
}

export default SettingsSection;
