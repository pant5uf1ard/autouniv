(async () => {
  let isEndSent = false;
  function sendEndSignal() {
    if (isEndSent) return;
    isEndSent = true;
    chrome.runtime.sendMessage({ message: "end" });
  }
  const TIMEOUT_ERR_TEXT = "__TIMEOUT__";
  const DEFAULT_INTERVAL = 300;
  const DEFAULT_WAIT_TIMEOUT = 0;
  const PLAYRATE = (await chrome.runtime.sendMessage({ message: "playrate" })) ?? "8";

  function waitFor({ checker, interval = DEFAULT_INTERVAL, timeout = DEFAULT_WAIT_TIMEOUT }) {
    let isTimeout = false;
    const checkTimeout = () => isTimeout;
    if (DEFAULT_WAIT_TIMEOUT)
      setTimeout(() => {
        isTimeout = true;
      }, timeout);

    return new Promise((resolve, reject) => {
      (function waitFor() {
        try {
          if (timeout && checkTimeout()) return reject(TIMEOUT_ERR_TEXT);
          if (checker()) return resolve();

          setTimeout(waitFor, interval);
        } catch (err) {
          return reject(err);
        }
      })();
    });
  }

  function observeOkAndClear() {
    const $confirmDialog = document.querySelector("#confirm-dialog");
    if (!$confirmDialog) return;
    new MutationObserver(() => {
      const $okBtn = $confirmDialog.querySelector(".confirm-ok-btn");
      if (!$okBtn) return;
      if ($confirmDialog.style.display !== "table") return;
      $okBtn.click();
    }).observe($confirmDialog, { attributes: true });
  }

  function observeReplay(startTime) {
    const $replayBtn = document.querySelector(".player-restart-btn");
    if (!$replayBtn) return;
    let timeoutId = null;
    new MutationObserver(() => {
      if (!$replayBtn.style.display || $replayBtn.style.display === "none") return;
      // 재생 시작 후 최소 5초 이후에만 "end" 전송 (즉시 스킵 방지)
      if (Date.now() - startTime < 5000) return;
      if (!timeoutId)
        timeoutId = setTimeout(() => {
          $replayBtn.click();
          sendEndSignal();
        }, 1000);
    }).observe($replayBtn, { attributes: true });
  }

  function checkPlay() {
    const $frontScreen = document.querySelector("#front-screen");
    if (!$frontScreen) return false;
    if ($frontScreen.style.display === "none") return true;
    // Firefox는 소리가 있는 자동 재생을 차단하므로 재생 버튼을 누르기 전에 음소거
    document.querySelectorAll("video").forEach(($video) => {
      $video.muted = true;
    });
    const $playBtn = $frontScreen.querySelector(".vc-front-screen-play-btn");
    if (!$playBtn) return false;
    $playBtn.click();
    return false;
  }

  function tryClickPlayrate() {
    const $btn = document.querySelector(`.vc-pctrl-playback-rate-btn:nth-child(${PLAYRATE})`);
    if ($btn) $btn.click();
    else console.log("[autouniv] clickPlayrate: 셀렉터 없음 (.vc-pctrl-playback-rate-btn:nth-child(" + PLAYRATE + "))");
  }

  function applyMute() {
    // 1순위: video 엘리먼트에 직접 muted 적용 (가장 확실)
    const $video = document.querySelector("video");
    if ($video) {
      $video.muted = true;
      return;
    }
    // 2순위: lcms 플레이어 음소거 버튼 클릭
    const $btn = document.querySelector(".vc-pctrl-volume-btn");
    if ($btn) $btn.click();
    else console.log("[autouniv] applyMute: video 엘리먼트도 볼륨 버튼도 없음");
  }

  // canvas 탭에 embed된 iframe 안에서만 자동 재생 기능 활성화
  const isInIframe = window !== window.top;
  if (isInIframe) {
    waitFor({ checker: checkPlay, timeout: 2000 })
      .then(() => {
        const startTime = Date.now();
        applyMute();
        tryClickPlayrate();
        try { observeOkAndClear(); } catch (e) { console.warn("[autouniv] observeOkAndClear 실패", e); }
        try { observeReplay(startTime); } catch (e) { console.warn("[autouniv] observeReplay 실패", e); }
      })
      .catch((err) => {
        console.warn("[autouniv] waitFor(checkPlay) 실패:", err);
      });
  }
})();
