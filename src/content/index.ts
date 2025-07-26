let isOpen = false;
let toggleButton: HTMLButtonElement | null = null;
let sidePanel: HTMLDivElement | null = null;
let isLoading = false;
let analysisResult: any = null;
let globalIframeContent = "";

const ANALYZE_API = "https://5a6659b6cef6.ngrok-free.app";
const CHAT_API = "https://ae4038d76e36.ngrok-free.app";

interface AnalysisResult {
  category: string;
  isAd: boolean;
  backAdPercentage: number;
  adProbability: number;
  adUrls: string[];
  comment: string;
}

interface ChatMessage {
  content: string;
  type: "user" | "bot";
  timestamp: number;
}

function createToggleButton() {
  setTimeout(() => {
    analyzeCurrentPage();
  }, 2000);

  toggleButton = document.createElement("button");
  toggleButton.innerHTML = `<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M10 4 L6 8 L10 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  toggleButton.style.cssText = `
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #5A9CFF;
    color: white;
    border: none;
    cursor: pointer;
    z-index: 10000;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(90, 156, 255, 0.3);
  `;

  toggleButton.addEventListener("mouseenter", () => {
    if (toggleButton) {
      toggleButton.style.background = "#4A8FFF";
      toggleButton.style.transform = "translateY(-50%) scale(1.05)";
      toggleButton.style.boxShadow = "0 4px 16px rgba(90, 156, 255, 0.4)";
    }
  });

  toggleButton.addEventListener("mouseleave", () => {
    if (toggleButton) {
      toggleButton.style.background = "#5A9CFF";
      toggleButton.style.transform = "translateY(-50%)";
      toggleButton.style.boxShadow = "0 2px 12px rgba(90, 156, 255, 0.3)";
    }
  });

  toggleButton.addEventListener("click", openSidePanel);
  document.body.appendChild(toggleButton);
}

function extractBlogContent(): string {
  if (globalIframeContent.length > 50) {
    console.log("전체 블로그 내용:", globalIframeContent);
    return globalIframeContent;
  }

  let content = "";

  // iframe이 있는지 확인 (네이버 블로그의 경우)
  const mainFrame = document.querySelector("#mainFrame") as HTMLIFrameElement;
  if (mainFrame && mainFrame.contentDocument) {
    try {
      const iframeDoc = mainFrame.contentDocument;
      const naverSelectors = [
        ".se-main-container .se-component .se-text",
        ".se-main-container .se-component",
        ".se-module-text",
        ".se-text-paragraph",
        "#postViewArea",
        ".post-view",
        ".entry-content",
        ".se-main-container",
      ];

      for (const selector of naverSelectors) {
        const elements = iframeDoc.querySelectorAll(selector);
        if (elements.length > 0) {
          const textContent = Array.from(elements)
            .map((el) => el.textContent?.trim() || "")
            .filter((text) => text.length > 10)
            .join(" ");

          if (textContent.length > content.length) {
            content = textContent;
          }
        }
      }
    } catch (error) {
      console.log("iframe 접근 제한:", error);
    }
  }

  if (content.length < 50) {
    const naverSelectors = [
      ".se-main-container .se-component .se-text",
      ".se-main-container .se-component",
      ".se-module-text",
      ".se-text-paragraph",
      "#postViewArea",
      ".post-view",
      ".entry-content",
    ];

    for (const selector of naverSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        const textContent = Array.from(elements)
          .map((el) => el.textContent?.trim() || "")
          .filter((text) => text.length > 10)
          .join(" ");

        if (textContent.length > content.length) {
          content = textContent;
        }
      }
    }
  }

  if (content.length < 50) {
    const urlMatch = window.location.href.match(/blogId=([^&]+).*logNo=(\d+)/);
    if (urlMatch) {
      content = `네이버 블로그 포스트 - 블로그 ID: ${urlMatch[1]}, 포스트 번호: ${urlMatch[2]}`;
    } else {
      content = window.location.href + " - 네이버 블로그 포스트";
    }
  }

  content = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[\n\r\t]/g, " ")
    .trim();

  console.log("전체 블로그 내용:", content);
  return content.substring(0, 3000);
}

async function analyzeCurrentPage(): Promise<AnalysisResult | null> {
  try {
    const content = extractBlogContent();

    const response = await fetch(`${ANALYZE_API}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        url: window.location.href,
        content: content,
      }),
    });

    if (!response.ok) throw new Error("분석 요청 실패");

    return await response.json();
  } catch (error) {
    console.error("분석 오류:", error);
    return null;
  }
}

async function sendChatMessage(
  _userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  try {
    let content = extractBlogContent();
    if (content.length < 100 && globalIframeContent.length > 50) {
      content = globalIframeContent;
    }
    const chat = chatHistory.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    const response = await fetch(`${CHAT_API}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        chat: chat,
        content: content,
      }),
    });

    if (!response.ok) throw new Error("채팅 요청 실패");

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("채팅 오류:", error);
    return "죄송합니다. 응답을 생성할 수 없습니다.";
  }
}

function createAnalysisResultView(_result: AnalysisResult): string {
  return "";
}

function createSidePanel() {
  sidePanel = document.createElement("div");
  sidePanel.innerHTML = `
    <style>
      #chat-container::-webkit-scrollbar { width: 4px; }
      #chat-container::-webkit-scrollbar-track { background: transparent; }
      #chat-container::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
      #chat-container::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
    </style>
    <div id="panel" style="
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: #fafbfc;
      border-left: 1px solid #e1e5e9;
      transform: translateX(100%);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 9999;
      box-shadow: -2px 0 24px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
    ">
      <div style="
        position: relative;
        height: 52px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 20px;
        border-bottom: 1px solid #f1f3f5;
        flex-shrink: 0;
      ">
        <button id="close-btn" style="
          width: 28px;
          height: 28px;
          background: #f8f9fa;
          color: #6b7280;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div style="
        flex: 1;
        padding: 16px;
        padding-bottom: 80px;
        overflow-y: auto;
        background: #fafbfc;
        scrollbar-width: thin;
        scrollbar-color: #d1d5db transparent;
      " id="main-container">
        <div id="chat-container"></div>
      </div>
      
      <div style="
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        z-index: 10;
      ">
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          max-width: 340px;
          margin: 0 auto;
        ">
          <input type="text" placeholder="메시지를 입력하세요..." id="chat-input" style="
            width: 100%;
            border: 1px solid #e1e5e9;
            border-radius: 24px;
            padding: 14px 52px 14px 20px;
            font-size: 14px;
            color: #374151;
            outline: none;
            transition: all 0.2s ease;
            background: white;
            box-sizing: border-box;
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
          " />
          <button id="send-btn" style="
            position: absolute;
            right: 6px;
            width: 36px;
            height: 36px;
            background: #5A9CFF;
            border: none;
            cursor: pointer;
            border-radius: 18px;
            color: white;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(90, 156, 255, 0.3);
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const panel = sidePanel.querySelector("#panel") as HTMLDivElement;
  const closeBtn = sidePanel.querySelector("#close-btn") as HTMLButtonElement;
  const chatContainer = sidePanel.querySelector(
    "#chat-container"
  ) as HTMLDivElement;
  const chatInput = sidePanel.querySelector("#chat-input") as HTMLInputElement;
  const sendBtn = sidePanel.querySelector("#send-btn") as HTMLButtonElement;

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "#e5e7eb";
    closeBtn.style.color = "#374151";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "#f8f9fa";
    closeBtn.style.color = "#6b7280";
  });
  closeBtn.addEventListener("click", closeSidePanel);

  function loadChatHistory(): ChatMessage[] {
    const history = localStorage.getItem("adspy-chat-history");
    return history ? JSON.parse(history) : [];
  }

  function saveChatHistory(messages: ChatMessage[]) {
    localStorage.setItem("adspy-chat-history", JSON.stringify(messages));
  }

  function renderMessages() {
    const messages = loadChatHistory();
    chatContainer.innerHTML = "";

    messages.forEach((msg: ChatMessage, index: number) => {
      const messageWrapper = document.createElement("div");
      messageWrapper.style.cssText = `
        display: flex;
        justify-content: ${msg.type === "user" ? "flex-end" : "flex-start"};
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
      messageDiv.textContent = msg.content;
      messageWrapper.appendChild(messageDiv);
      chatContainer.appendChild(messageWrapper);
    });

    const mainContainer = sidePanel?.querySelector(
      "#main-container"
    ) as HTMLDivElement;
    if (mainContainer) {
      mainContainer.scrollTo({
        top: mainContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  function addMessage(content: string, type: "user" | "bot") {
    const messages = loadChatHistory();
    messages.push({ content, type, timestamp: Date.now() });
    saveChatHistory(messages);
    renderMessages();
  }

  function setLoading(loading: boolean) {
    isLoading = loading;
    sendBtn.disabled = loading;
    chatInput.disabled = loading;

    if (loading) {
      sendBtn.style.background = "#9ca3af";
      sendBtn.style.cursor = "not-allowed";
      chatInput.style.background = "#f9fafb";
      chatInput.style.color = "#9ca3af";
    } else {
      sendBtn.style.background = "#5A9CFF";
      sendBtn.style.cursor = "pointer";
      chatInput.style.background = "white";
      chatInput.style.color = "#374151";
    }
  }

  async function sendMessage() {
    if (isLoading) return;

    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    chatInput.value = "";
    setLoading(true);

    const chatHistory = loadChatHistory();
    const response = await sendChatMessage(message, chatHistory);

    addMessage(response, "bot");
    setLoading(false);
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
    if (!isLoading) {
      chatInput.style.borderColor = "#5A9CFF";
      chatInput.style.background = "white";
      chatInput.style.boxShadow =
        "0 0 0 3px rgba(90, 156, 255, 0.06), 0 4px 16px rgba(0, 0, 0, 0.1)";
    }
  });
  chatInput.addEventListener("blur", () => {
    chatInput.style.borderColor = "#e1e5e9";
    chatInput.style.background = "white";
    chatInput.style.boxShadow = "0 3px 12px rgba(0, 0, 0, 0.08)";
  });

  async function initializePanel() {
    renderMessages();
  }

  document.body.appendChild(sidePanel);

  setTimeout(() => {
    panel.style.transform = "translateX(0)";
    initializePanel();
  }, 10);
}

function openSidePanel() {
  if (isOpen) return;
  isOpen = true;
  if (toggleButton) toggleButton.style.display = "none";
  createSidePanel();
}

function closeSidePanel() {
  if (!isOpen) return;
  isOpen = false;

  if (sidePanel) {
    const panel = sidePanel.querySelector("#panel") as HTMLDivElement;
    panel.style.transform = "translateX(100%)";

    setTimeout(() => {
      if (sidePanel) {
        sidePanel.remove();
        sidePanel = null;
      }
      if (toggleButton) toggleButton.style.display = "flex";
    }, 250);
  }
}

const isInIframe = window !== window.top;

if (isInIframe) {
  function sendContentToParent() {
    const content = extractBlogContentFromIframe();
    if (content.length > 50) {
      window.parent.postMessage(
        {
          type: "BLOG_CONTENT",
          content: content,
          url: window.location.href,
        },
        "*"
      );
    }
  }

  function extractBlogContentFromIframe(): string {
    let content = "";
    const naverSelectors = [
      ".se-main-container .se-component .se-text",
      ".se-main-container .se-component",
      ".se-module-text",
      ".se-text-paragraph",
      "#postViewArea",
      ".post-view",
      ".entry-content",
      ".se-main-container",
    ];

    for (const selector of naverSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        const textContent = Array.from(elements)
          .map((el) => el.textContent?.trim() || "")
          .filter((text) => text.length > 10)
          .join(" ");

        if (textContent.length > content.length) {
          content = textContent;
        }
      }
    }

    return content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[\n\r\t]/g, " ")
      .trim()
      .substring(0, 3000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sendContentToParent);
  } else {
    sendContentToParent();
  }
} else {
  window.addEventListener("message", (event) => {
    if (event.data.type === "BLOG_CONTENT") {
      globalIframeContent = event.data.content;
      console.log(
        "iframe에서 콘텐츠 수신:",
        globalIframeContent.substring(0, 100)
      );
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createToggleButton);
  } else {
    createToggleButton();
  }
}
