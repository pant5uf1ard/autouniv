/* eslint-disable @typescript-eslint/no-throw-literal */
import "@testing-library/jest-dom";
import { render } from "@/__test__/customRender";
import mockStorage from "@/__test__/mock/storage";
import { cleanup, screen, waitFor } from "@testing-library/react";
import { ERRORS } from "@/constants";
import { MESSAGES } from "@/i18n";
import ErrorBoundary from "./ErrorBoundary";

interface ErrorComponentProps {
  error?: boolean;
  errorType?: string;
}

describe("ErrorBoundary UI Test ", () => {
  const REACT_ERROR_MESSAGE = "The above error occurred in the <ErrorComponent> component";
  const NORMAL_TEXT = "normal";

  function ErrorComponent({ error, errorType }: ErrorComponentProps) {
    if (error) {
      if (errorType === ERRORS.AUTH.name)
        throw {
          ...ERRORS.AUTH,
          message: MESSAGES.ko.errors.AUTH,
          response: { status: 401 },
        };
      throw { ...ERRORS.UNEXPECTED, message: MESSAGES.ko.errors.UNEXPECTED };
    }
    return <p>{NORMAL_TEXT}</p>;
  }

  const originalError = console.error.bind(console.error);
  const getUnexpectedFallbackUI = () => screen.getByText(MESSAGES.ko.errors.UNEXPECTED);
  const getAuthFallbackUI = () => screen.getByText(MESSAGES.ko.errors.AUTH);
  const getNormalUI = () => screen.getByText(NORMAL_TEXT);

  beforeEach(() => {
    jest
      .spyOn(console, "error")
      .mockImplementation(
        (msg) =>
          !Object.values(MESSAGES.ko.errors).some((message) => msg?.message?.includes(message)) &&
          !msg.toString().includes(REACT_ERROR_MESSAGE) &&
          originalError(msg)
      );
    mockStorage();
  });
  afterEach(() => {
    jest.resetAllMocks();
    cleanup();
  });

  test("ErrorBoundary should show auth fallback UI when 401 error is thrown", async () => {
    await render(
      <ErrorBoundary>
        <ErrorComponent error errorType={ERRORS.AUTH.name} />
      </ErrorBoundary>
    );
    await waitFor(() => expect(getAuthFallbackUI()).toBeTruthy());
  });

  test("ErrorBoundary should show unexpected fallback UI when other error is thrown", async () => {
    await render(
      <ErrorBoundary>
        <ErrorComponent error errorType={ERRORS.UNEXPECTED.name} />
      </ErrorBoundary>
    );
    await waitFor(() => expect(getUnexpectedFallbackUI()).toBeTruthy());
  });

  test("ErrorBoundary should not show fallback UI in normal cases", async () => {
    await render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(getNormalUI()).toBeTruthy();
  });
});
