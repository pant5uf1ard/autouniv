Object.assign(global, require("jest-chrome"));

// UI 텍스트 테스트는 한국어 기준 (기본 언어는 브라우저 언어를 따름)
Object.defineProperty(navigator, "language", { value: "ko-KR", configurable: true });
