import {
  CreateElement,
  CreateElementClassName,
  CreateElementId,
  GetBody,
  PushElements,
  extractBlogContent,
  parseNaverBlogUrl,
} from "./common";
import { analyzeCurrentPage, AnalysisResult, sendChatMessage } from "./api";

let isOpen = false;
let analysisPromise: Promise<AnalysisResult | null> | null = null;
let isAnalyzing = false;

const body = GetBody();

function getUrlInfo() {
  return parseNaverBlogUrl();
}

async function ensureAnalysisComplete(): Promise<AnalysisResult | null> {
  const urlInfo = getUrlInfo();
  if (!urlInfo) return null;

  const { analysisKey } = urlInfo;

  if (analysisPromise) {
    return analysisPromise;
  }

  const existingData = localStorage.getItem(analysisKey);
  if (existingData) {
    try {
      const parsedData = JSON.parse(existingData);
      return Promise.resolve(parsedData);
    } catch (error) {
      localStorage.removeItem(analysisKey);
    }
  }

  if (!isAnalyzing) {
    isAnalyzing = true;

    analysisPromise = (async () => {
      try {
        const content = extractBlogContent();
        const analysisResult = await analyzeCurrentPage(content);

        if (analysisResult) {
          localStorage.setItem(analysisKey, JSON.stringify(analysisResult));
          return analysisResult;
        }
        return null;
      } catch (error) {
        return null;
      } finally {
        isAnalyzing = false;
        analysisPromise = null;
      }
    })();

    return analysisPromise;
  }

  return Promise.resolve(null);
}

function createToggleButton() {
  setTimeout(() => {
    ensureAnalysisComplete();
  }, 1000);

  const toggleBtn = CreateElementClassName("button", "toggle-btn");
  toggleBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M10 4 L6 8 L10 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  toggleBtn.addEventListener("click", async () => {
    toggleBtn.classList.add("hidden");
    await openSidePanel();
  });

  body.appendChild(toggleBtn);
}

async function createSidePanel() {
  const sidePanel = CreateElementId("div", "panel-wrapper");
  const sidePannelStyle = CreateElement("style");

  sidePannelStyle.innerHTML = `
    #chat-container::-webkit-scrollbar { width: 4px; }
    #chat-container::-webkit-scrollbar-track { background: transparent; }
    #chat-container::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
    #chat-container::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
    .analysis-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #6b7280;
      font-size: 12px;
    }
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e5e7eb;
      border-top: 2px solid #5a9cff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const panel = CreateElementId("div", "panel");
  const panelHader = CreateElementClassName("div", "panel-header");
  const pieChartWrapper = CreateElementId("div", "pie-chart-wrapper");

  pieChartWrapper.innerHTML = `
    <div class="analysis-loading">
      <div class="loading-spinner"></div>
      <span>분석 중...</span>
    </div>
  `;

  let analyzeData: AnalysisResult | null = await ensureAnalysisComplete();

  if (analyzeData) {
    const isAd = analyzeData.isAd || false;
    const value = isAd
      ? analyzeData.adProbability || 0
      : analyzeData.backAdPercentage || 0;
    const displayValue = Math.round(value);

    pieChartWrapper.innerHTML = "";
    pieChartWrapper.textContent = isAd ? "광고 확률" : "뒷광고 의심도";

    const pieChart = CreateElementId("div", "pie-chart");
    const pieChartCircle = CreateElementId("div", "pie-chart-circle");

    pieChartCircle.style.cssText = `
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: conic-gradient(#5A9CFF 0% ${value}%, #e5e7eb ${value}% 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    `;

    const pieChartInnerCircle = CreateElementId(
      "div",
      "pie-chart-inner-circle"
    );
    pieChartInnerCircle.textContent = `${displayValue}%`;
    pieChartInnerCircle.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: #374151;
    `;

    PushElements(pieChart, [pieChartCircle, pieChartInnerCircle]);
    PushElements(pieChartWrapper, [pieChart]);
  } else {
    pieChartWrapper.innerHTML = `
      <div class="analysis-loading">
        <div style="color: #ef4444; font-size: 16px;">⚠️</div>
        <span style="color: #ef4444;">분석 실패</span>
      </div>
    `;
  }

  const closeBtn = CreateElementId("button", "close-btn");
  closeBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M18 6L6 18M6 6l12 12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const chatContainer = CreateElementId("div", "chat-container");
  const chatInputPart = CreateElementClassName("div", "chat-input-part");
  const chatInputWrapper = CreateElementClassName("div", "chat-input-wrapper");
  const chatInput = CreateElementId("input", "chat-input");
  chatInput.type = "text";
  chatInput.placeholder = "메시지를 입력하세요...";

  const sendBtn = CreateElementId("button", "send-btn");
  sendBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  `;

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "#e5e7eb";
    closeBtn.style.color = "#374151";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "#f8f9fa";
    closeBtn.style.color = "#6b7280";
  });
  closeBtn.addEventListener("click", closeSidePanel);

  PushElements(panelHader, [pieChartWrapper, closeBtn]);
  PushElements(chatInputWrapper, [chatInput, sendBtn]);
  PushElements(chatInputPart, [chatInputWrapper]);
  PushElements(panel, [panelHader, chatContainer, chatInputPart]);
  PushElements(sidePanel, [panel]);

  function loadChatHistory() {
    const urlInfo = getUrlInfo();
    if (!urlInfo) return [];
    const history = localStorage.getItem(urlInfo.chatKey);
    return history ? JSON.parse(history) : [];
  }

  function saveChatHistory(messages: any[]) {
    const urlInfo = getUrlInfo();
    if (!urlInfo) return;
    localStorage.setItem(urlInfo.chatKey, JSON.stringify(messages));
  }

  function renderMessages() {
    const messages = loadChatHistory();
    chatContainer.innerHTML = "";

    messages.forEach((msg: any, index: number) => {
      const messageWrapper = document.createElement("div");
      messageWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: ${msg.type === "user" ? "flex-end" : "flex-start"};
        margin-bottom: ${index === messages.length - 1 ? "4px" : "14px"};
      `;

      const messageDiv = document.createElement("div");
      messageDiv.style.cssText = `
        background: ${msg.type === "user" ? "#5A9CFF" : "white"};
        color: ${msg.type === "user" ? "white" : "#374151"};
        padding: 10px 14px;
        border-radius: ${
          msg.type === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px"
        };
        max-width: 75%;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
        border: ${msg.type === "user" ? "none" : "1px solid #f1f3f5"};
        box-shadow: ${
          msg.type === "user"
            ? "0 1px 6px rgba(90, 156, 255, 0.2)"
            : "0 1px 3px rgba(0,0,0,0.04)"
        };
        font-weight: ${msg.type === "user" ? "500" : "400"};
      `;

      if (msg.type === "bot" && msg.result) {
        const contentDiv = document.createElement("div");
        contentDiv.textContent = msg.content;

        const resultDiv = document.createElement("div");
        resultDiv.style.cssText = `
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          color: #3b82f6;
          font-size: 13px;
          font-weight: 500;
        `;

        const arrowIcon = document.createElement("span");
        arrowIcon.innerHTML = "→";
        arrowIcon.style.cssText = `font-size: 16px; font-weight: bold;`;

        const resultText = document.createElement("span");
        resultText.textContent = msg.result;

        resultDiv.appendChild(arrowIcon);
        resultDiv.appendChild(resultText);
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(resultDiv);
      } else {
        messageDiv.textContent = msg.content;
      }

      messageWrapper.appendChild(messageDiv);
      chatContainer.appendChild(messageWrapper);
    });

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }

  function addMessage(
    content: string,
    type: "user" | "bot",
    result?: string | null
  ) {
    const messages = loadChatHistory();
    if (result === "null") result = null;
    messages.push({ content, type, timestamp: Date.now(), result });
    saveChatHistory(messages);
    renderMessages();
  }

  function addLoadingMessage() {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loading-message";
    loadingDiv.style.cssText = `
      display: flex;
      justify-content: flex-start;
      margin-bottom: 14px;
    `;

    const bubbleDiv = document.createElement("div");
    bubbleDiv.style.cssText = `
      background: white;
      color: #374151;
      padding: 10px 14px;
      border-radius: 16px 16px 16px 4px;
      max-width: 75%;
      font-size: 14px;
      border: 1px solid #f1f3f5;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const dotsDiv = document.createElement("div");
    dotsDiv.style.cssText = `display: flex; gap: 3px;`;

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.style.cssText = `
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #9ca3af;
        animation: loading-dots 1.4s infinite;
        animation-delay: ${i * 0.2}s;
      `;
      dotsDiv.appendChild(dot);
    }

    const style = document.createElement("style");
    style.textContent = `
      @keyframes loading-dots {
        0%, 60%, 100% { opacity: 0.3; }
        30% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    bubbleDiv.appendChild(document.createTextNode("생성 중"));
    bubbleDiv.appendChild(dotsDiv);
    loadingDiv.appendChild(bubbleDiv);
    chatContainer.appendChild(loadingDiv);

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }

  function removeLoadingMessage() {
    const loadingMessage = chatContainer.querySelector("#loading-message");
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }

  let isLoading = false;

  async function sendMessage() {
    if (isLoading) return;

    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    chatInput.value = "";
    isLoading = true;
    sendBtn.disabled = true;
    chatInput.disabled = true;

    sendBtn.style.background = "#9ca3af";
    sendBtn.style.cursor = "not-allowed";
    chatInput.style.background = "#f9fafb";
    chatInput.style.color = "#9ca3af";

    addLoadingMessage();

    const chatHistory = loadChatHistory();
    const content = extractBlogContent();

    const response = await sendChatMessage(message, chatHistory, content);

    removeLoadingMessage();
    addMessage(response.content, "bot", response.result);

    isLoading = false;
    sendBtn.disabled = false;
    chatInput.disabled = false;

    sendBtn.style.background = "#5A9CFF";
    sendBtn.style.cursor = "pointer";
    chatInput.style.background = "white";
    chatInput.style.color = "#374151";
  }

  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !isLoading) sendMessage();
  });

  sendBtn.addEventListener("mouseenter", () => {
    if (!isLoading) {
      sendBtn.style.background = "#4A8FFF";
      sendBtn.style.transform = "scale(1.05)";
      sendBtn.style.boxShadow = "0 2px 8px rgba(90, 156, 255, 0.4)";
    }
  });
  sendBtn.addEventListener("mouseleave", () => {
    if (!isLoading) {
      sendBtn.style.background = "#5A9CFF";
      sendBtn.style.transform = "scale(1)";
      sendBtn.style.boxShadow = "0 1px 4px rgba(90, 156, 255, 0.3)";
    }
  });

  chatInput.addEventListener("focus", () => {
    chatInput.style.borderColor = "#5A9CFF";
    chatInput.style.background = "white";
    chatInput.style.boxShadow =
      "0 0 0 3px rgba(90, 156, 255, 0.06), 0 4px 16px rgba(0, 0, 0, 0.1)";
  });
  chatInput.addEventListener("blur", () => {
    chatInput.style.borderColor = "#e1e5e9";
    chatInput.style.background = "white";
    chatInput.style.boxShadow = "0 3px 12px rgba(0, 0, 0, 0.08)";
  });

  renderMessages();
  document.body.appendChild(sidePanel);

  setTimeout(() => {
    panel.style.transform = "translateX(0)";
  }, 10);
}

async function openSidePanel() {
  if (isOpen) return;
  isOpen = true;
  await createSidePanel();
}

function closeSidePanel() {
  if (!isOpen) return;
  isOpen = false;

  const sidePanel = document.getElementById("panel-wrapper");
  if (sidePanel) {
    const panel = sidePanel.querySelector("#panel") as HTMLDivElement;
    panel.style.transform = "translateX(100%)";

    setTimeout(() => {
      if (sidePanel) {
        sidePanel.remove();
      }
      document.querySelector(".toggle-btn")?.classList.remove("hidden");
    }, 250);
  }
}

function InitSideBar() {
  createToggleButton();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", InitSideBar);
} else {
  InitSideBar();
}
