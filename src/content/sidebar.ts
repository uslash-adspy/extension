import {
  CreateElement,
  CreateElementClassName,
  CreateElementId,
  GetBody,
  PushElements,
} from "./common";

let isOpen = false;

const body = GetBody();

function createToggleButton() {
  const toggleBtn = CreateElementClassName("button", "toggle-btn");
  toggleBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M10 4 L6 8 L10 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  toggleBtn.addEventListener("click", () => {
    console.log(document.getElementById("head-skin"));

    toggleBtn.classList.add("hidden");
    openSidePanel();
  });

  body.appendChild(toggleBtn);
}

function createSidePanel() {
  const sidePanel = CreateElementId("div", "panel-wrapper");

  const sidePannelStyle = CreateElement("style");

  sidePannelStyle.innerHTML = `
    #chat-container::-webkit-scrollbar { width: 4px; }
    #chat-container::-webkit-scrollbar-track { background: transparent; }
    #chat-container::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
    #chat-container::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
  `;

  const panel = CreateElementId("div", "panel");

  const panelHader = CreateElementClassName("div", "panel-header");
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

  //   sidePanel = document.createElement("div");
  //   sidePanel.innerHTML = `
  //     <style>
  //       #chat-container::-webkit-scrollbar { width: 4px; }
  //       #chat-container::-webkit-scrollbar-track { background: transparent; }
  //       #chat-container::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
  //       #chat-container::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
  //     </style>
  //     <div id="panel" style="
  //       position: fixed;
  //       top: 0;
  //       right: 0;
  //       width: 380px;
  //       height: 100vh;
  //       background: #fafbfc;
  //       border-left: 1px solid #e1e5e9;
  //       transform: translateX(100%);
  //       transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  //       z-index: 9999;
  //       box-shadow: -2px 0 24px rgba(0, 0, 0, 0.08);
  //       display: flex;
  //       flex-direction: column;
  //     ">
  //       <div style="
  //         position: relative;
  //         height: 52px;
  //         background: white;
  //         display: flex;
  //         align-items: center;
  //         justify-content: flex-end;
  //         padding: 0 20px;
  //         border-bottom: 1px solid #f1f3f5;
  //         flex-shrink: 0;
  //       ">
  //         <button id="close-btn" style="
  //           width: 28px;
  //           height: 28px;
  //           background: #f8f9fa;
  //           color: #6b7280;
  //           border: none;
  //           cursor: pointer;
  //           transition: all 0.2s ease;
  //           display: flex;
  //           align-items: center;
  //           justify-content: center;
  //           border-radius: 14px;
  //         ">
  //           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  //             <path d="M18 6L6 18M6 6l12 12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  //           </svg>
  //         </button>
  //       </div>

  //       <div style="
  //         flex: 1;
  //         padding: 16px;
  //         padding-bottom: 80px;
  //         overflow-y: auto;
  //         background: #fafbfc;
  //         scrollbar-width: thin;
  //         scrollbar-color: #d1d5db transparent;
  //       " id="chat-container"></div>

  //       <div style="
  //         position: absolute;
  //         bottom: 20px;
  //         left: 20px;
  //         right: 20px;
  //         z-index: 10;
  //       ">
  //         <div style="
  //           position: relative;
  //           display: flex;
  //           align-items: center;
  //           max-width: 340px;
  //           margin: 0 auto;
  //         ">
  //           <input type="text" placeholder="메시지를 입력하세요..." id="chat-input" style="
  //             width: 100%;
  //             border: 1px solid #e1e5e9;
  //             border-radius: 24px;
  //             padding: 14px 52px 14px 20px;
  //             font-size: 14px;
  //             color: #374151;
  //             outline: none;
  //             transition: all 0.2s ease;
  //             background: white;
  //             box-sizing: border-box;
  //             box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  //           " />
  //           <button id="send-btn" style="
  //             position: absolute;
  //             right: 6px;
  //             width: 36px;
  //             height: 36px;
  //             background: #5A9CFF;
  //             border: none;
  //             cursor: pointer;
  //             border-radius: 18px;
  //             color: white;
  //             transition: all 0.15s ease;
  //             display: flex;
  //             align-items: center;
  //             justify-content: center;
  //             box-shadow: 0 2px 6px rgba(90, 156, 255, 0.3);
  //           ">
  //             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  //               <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  //             </svg>
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   `;

  //   const panel = sidePanel.querySelector("#panel") as HTMLDivElement;
  //   const closeBtn = sidePanel.querySelector("#close-btn") as HTMLButtonElement;
  //   const chatContainer = sidePanel.querySelector(
  //     "#chat-container"
  //   ) as HTMLDivElement;
  //   const chatInput = sidePanel.querySelector("#chat-input") as HTMLInputElement;
  //   const sendBtn = sidePanel.querySelector("#send-btn") as HTMLButtonElement;

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "#e5e7eb";
    closeBtn.style.color = "#374151";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "#f8f9fa";
    closeBtn.style.color = "#6b7280";
  });
  closeBtn.addEventListener("click", closeSidePanel);

  PushElements(panelHader, [closeBtn]);

  PushElements(chatInputWrapper, [chatInput, sendBtn]);

  PushElements(chatInputPart, [chatInputWrapper]);

  PushElements(panel, [panelHader, chatContainer, chatInputPart]);

  PushElements(sidePanel, [panel]);

  function loadChatHistory() {
    const history = localStorage.getItem("adspy-chat-history");
    return history ? JSON.parse(history) : [];
  }

  function saveChatHistory(messages: any[]) {
    localStorage.setItem("adspy-chat-history", JSON.stringify(messages));
  }

  function renderMessages() {
    const messages = loadChatHistory();
    chatContainer.innerHTML = "";

    messages.forEach((msg: any, index: number) => {
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

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }

  function addMessage(content: string, type: "user" | "bot") {
    const messages = loadChatHistory();
    messages.push({ content, type, timestamp: Date.now() });
    saveChatHistory(messages);
    renderMessages();
  }

  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    addMessage(message, "user");
    chatInput.value = "";
    setTimeout(() => addMessage("네, 분석 중입니다...", "bot"), 600);
  }

  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  sendBtn.addEventListener("mouseenter", () => {
    sendBtn.style.background = "#4A8FFF";
    sendBtn.style.transform = "scale(1.05)";
    sendBtn.style.boxShadow = "0 2px 8px rgba(90, 156, 255, 0.4)";
  });
  sendBtn.addEventListener("mouseleave", () => {
    sendBtn.style.background = "#5A9CFF";
    sendBtn.style.transform = "scale(1)";
    sendBtn.style.boxShadow = "0 1px 4px rgba(90, 156, 255, 0.3)";
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

function openSidePanel() {
  if (isOpen) return;
  isOpen = true;

  createSidePanel();
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
  //   const headSkin = document.getElementById("head-skin");
  //   if (headSkin) {
  //     const headSkinChilren = Array.from(headSkin.children);

  //     headSkin.innerHTML = "";

  //     const content = CreateElementClassName("div", "blog-content");

  //     PushElements(content, headSkinChilren);

  //     PushElements(headSkin, [content]);
  //   }
  createToggleButton();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", InitSideBar);
} else {
  InitSideBar();
}
