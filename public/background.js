// autouniv background service worker
// 팝업 생명주기와 무관하게 탭 관리 및 재생 처리

const CANVAS_URL = "https://canvas.skku.edu/";
const COURSES_URL = `${CANVAS_URL}courses`;
const ICAMPUS_TOOL_ID = 5;

function waitForTabComplete(tabId) {
  return new Promise((resolve) => {
    let timeoutId = 0;
    const listener = (updatedTabId, info) => {
      if (updatedTabId !== tabId || info.status !== "complete") return;

      clearTimeout(timeoutId);
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    };

    timeoutId = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, 5000);

    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function findCourseIdsInTab(tabId) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () =>
        Array.from(document.querySelectorAll('a[href*="/courses/"]'))
          .map((anchor) => anchor.href.match(/\/courses\/(\d+)/)?.[1])
          .filter((id, index, ids) => id && ids.indexOf(id) === index),
    });

    return result || [];
  } catch {
    return [];
  }
}

async function openCanvasTabForAuth() {
  const tabs = await chrome.tabs.query({ url: "*://canvas.skku.edu/*" });
  const existingTab = tabs.find((tab) => tab.id);

  if (existingTab?.id) {
    await chrome.tabs.update(existingTab.id, { active: true, url: CANVAS_URL });
    await waitForTabComplete(existingTab.id);
    return existingTab.id;
  }

  const tab = await chrome.tabs.create({ url: CANVAS_URL });
  if (tab.id) await waitForTabComplete(tab.id);
  return tab.id || null;
}

async function openIcampusToolForAuth() {
  const tabId = await openCanvasTabForAuth();
  if (!tabId) return;

  const dashboardCourseIds = await findCourseIdsInTab(tabId);

  if (dashboardCourseIds.length === 0) {
    await chrome.tabs.update(tabId, { url: COURSES_URL });
    await waitForTabComplete(tabId);
  }

  const courseIds =
    dashboardCourseIds.length > 0 ? dashboardCourseIds : await findCourseIdsInTab(tabId);
  const courseId = courseIds[0];

  if (!courseId) return;

  await chrome.tabs.update(tabId, {
    url: `${CANVAS_URL}courses/${courseId}/external_tools/${ICAMPUS_TOOL_ID}`,
  });
}

function injectOverlay(src) {
  const OVERLAY_ID = "autouniv-player-overlay";
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) {
    const iframe = existing.querySelector("iframe");
    if (iframe) {
      iframe.src = src;
      return;
    }
    existing.remove();
  }

  // 페이지에 이미 존재하는 lcms iframe을 비워서 세션 충돌 방지
  document.querySelectorAll('iframe[src*="lcms.skku.edu"]').forEach((f) => {
    f.src = "about:blank";
  });

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;";

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:relative;width:854px;max-width:95vw;background:#000;border-radius:8px;overflow:hidden;";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.style.cssText =
    "position:absolute;top:8px;right:8px;z-index:1;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:16px;";
  closeBtn.onclick = () => {
    overlay.remove();
    chrome.storage.local.set({ autouniv_playing_src: null });
  };

  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.style.cssText = "width:854px;max-width:95vw;height:480px;border:none;display:block;";
  iframe.allow = "autoplay; fullscreen";
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("muted", "");

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
      chrome.storage.local.set({ autouniv_playing_src: null });
    }
  });

  wrapper.appendChild(closeBtn);
  wrapper.appendChild(iframe);
  overlay.appendChild(wrapper);
  document.body.appendChild(overlay);
}

async function playOnCanvas(src) {
  const tabs = await chrome.tabs.query({ url: "*://canvas.skku.edu/*" });

  if (tabs.length === 0) {
    // canvas 탭 없으면 background에서 생성 (팝업 닫혀도 안전)
    const tab = await chrome.tabs.create({ url: "https://canvas.skku.edu" });
    const listener = (tabId, info) => {
      if (tabId === tab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.scripting
          .executeScript({ target: { tabId }, func: injectOverlay, args: [src] })
          .catch(() => {});
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  } else {
    const target = tabs[0];
    await chrome.tabs.update(target.id, { active: true });
    await chrome.scripting
      .executeScript({ target: { tabId: target.id }, func: injectOverlay, args: [src] })
      .catch(() => {});
  }
}

async function stopCanvas() {
  const tabs = await chrome.tabs.query({ url: "*://canvas.skku.edu/*" });
  for (const tab of tabs) {
    if (tab.id) {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          func: () => {
            const el = document.getElementById("autouniv-player-overlay");
            if (el) el.remove();
          },
        })
        .catch(() => {});
    }
  }
}

let isHandlingEnd = false; // 중복 실행 방지용 Lock

// 팝업으로부터 재생 요청 수신
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "AUTOUNIV_AUTH_OPEN") {
    openIcampusToolForAuth()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, message: error?.message }));
    return true;
  }

  // 팝업 → background 재생 요청
  if (message.type === "AUTOUNIV_PLAY") {
    chrome.storage.local.get(["autouniv_playlist"]).then((result) => {
      const nextPlaylist =
        message.playlist ||
        (result.autouniv_playlist?.length ? result.autouniv_playlist : [message.src]);

      chrome.storage.local
        .set({
          autouniv_playing_src: message.src,
          autouniv_playing_idx: message.idx ?? 0,
          autouniv_playlist: nextPlaylist,
        })
        .then(() => playOnCanvas(message.src));
    });
    return;
  }

  // lcms 플레이어 → background 메시지
  // Firefox는 sender.origin을 제공하지 않을 수 있으므로 sender.url로 대체
  let senderHost = "";
  try {
    senderHost = new URL(sender.origin || sender.url || "").hostname;
  } catch {
    return;
  }
  if (!senderHost.endsWith("lcms.skku.edu")) return;

  if (message.message === "playrate") {
    chrome.storage.local.get(["autouniv_settings"], (result) => {
      const settings = result.autouniv_settings || {};
      sendResponse(settings.PLAYRATE || "8");
    });
    return true;
  }

  if (message.message === "end") {
    handleVideoEnd();
  }
});

async function handleVideoEnd() {
  if (isHandlingEnd) return;
  isHandlingEnd = true;

  try {
    const result = await chrome.storage.local.get([
      "autouniv_playlist",
      "autouniv_playing_idx",
      "playList",
    ]);
    const playlist = result.autouniv_playlist || [];
    const currentIdx = result.autouniv_playing_idx ?? 0;
    const nextIdx = currentIdx + 1;

    const playListItems = result.playList || [];

    if (nextIdx >= playlist.length) {
      // 마지막 영상 완료
      await chrome.storage.local.set({ autouniv_playing_src: null });
      if (playListItems.length > 0) {
        await chrome.storage.local.set({ playList: [] });
      }
      await stopCanvas();
      return;
    }

    const nextSrc = playlist[nextIdx];

    // playing_src를 먼저 업데이트해야 popup onChanged 타이밍 이슈 방지
    // (playList 업데이트 시 popup Player.tsx가 재반응할 때 가드가 올바르게 작동)
    await chrome.storage.local.set({
      autouniv_playing_idx: nextIdx,
      autouniv_playing_src: nextSrc,
    });

    // 그 다음 playList에서 완료된 항목 제거 (popup onChanged 트리거)
    if (playListItems.length > 0) {
      await chrome.storage.local.set({ playList: playListItems.slice(1) });
    }

    await playOnCanvas(nextSrc);
  } finally {
    // 다음 상태 전환을 마친 후 안전하게 Lock 해제
    setTimeout(() => {
      isHandlingEnd = false;
    }, 2000);
  }
}
