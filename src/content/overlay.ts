import { CreateElement, PushElements, GetBody } from "./common";

const CreateOverlay = () => {
  const overlay = CreateElement("div", "overlay");

  const overlayCloseBtn = CreateElement("p", "overlay-close-btn");

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(sender);

  if (message.type === "SHOW_OVERLAY") {
    OverlayShow();

    sendResponse({ success: true });
  }
});
