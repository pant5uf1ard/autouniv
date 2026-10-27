import { MESSAGES } from "@/i18n";
import { render } from "@/__test__/customRender";
import mockStorage from "@/__test__/mock/storage";
import "@testing-library/jest-dom";
import { cleanup, screen } from "@testing-library/react";
import Settings from "./Settings";

describe("Settings section UI test", () => {
  beforeEach(() => mockStorage());
  afterEach(() => cleanup());

  const getVersion = () => screen.getByText(MESSAGES.ko.settingsSection.version);
  const getGithub = () => screen.getByText(MESSAGES.ko.settingsSection.report);
  const getSettings = () =>
    Object.values(MESSAGES.ko.settings).map((title) => screen.getByText(title));

  test("Version and developer infos should be displayed", async () => {
    await render(<Settings />);
    getVersion();
    getGithub();
  });

  test("Settings are correctly displayed", async () => {
    await render(<Settings />);
    getSettings();
  });
});
