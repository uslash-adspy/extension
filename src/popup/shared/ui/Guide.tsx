export const Guide = () => {
  const OpenOverlay = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { type: "SHOW_OVERLAY" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "content script 에러 또는 미삽입:",
              chrome.runtime.lastError
            );
          } else {
            console.log("오버레이 띄움:", response);
          }
        });
      }
    });
  };

  return (
    <>
      <div className="w-full flex justify-end">
        <p
          className="text-caption font-bold text-dark_grey underline underline-offset-1 cursor-pointer select-none"
          onClick={() => {
            OpenOverlay();
            window.close();
          }}
        >
          가이드 보기
        </p>
      </div>
    </>
  );
};
