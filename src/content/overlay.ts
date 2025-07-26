import { CreateElementClassName, PushElements, GetBody } from "./common";

const CreateOverlay = () => {
  const overlay = CreateElementClassName("div", "overlay");
  const overlayCloseBtn = CreateElementClassName("p", "overlay-close-btn");

  overlayCloseBtn.textContent = "X";
  overlayCloseBtn.addEventListener("click", () => {
    overlay.classList.add("overlay-hidden");
  });

  PushElements(overlay, [overlayCloseBtn]);
  return overlay;
};

const OverlayShow = () => {
  const body = GetBody();
  const overlay = CreateOverlay();
  body.insertBefore(overlay, body.firstChild);
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SHOW_OVERLAY") {
    OverlayShow();
    sendResponse({ success: true });
  }
});
