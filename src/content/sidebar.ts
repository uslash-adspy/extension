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

  const pieChartWrapper = CreateElementId("div", "pie-chart-wrapper");

  pieChartWrapper.textContent = "현재 의심도";

  const pieChart = CreateElementId("div", "pie-chart");

  const pieChartCircle = CreateElementId("div", "pie-chart-circle");

  const value = 80; // 0~100 사이 값
  const percentAngle = 360 * (value / 100);

  const size = 50;
  const radius = size / 2;
  const center = size / 2;

  const degToRad = (deg: number) => (Math.PI / 180) * deg;
  const startAngle = -90;

  const getCoordinates = (angle: number) => {
    const x = center + radius * Math.cos(degToRad(angle));
    const y = center + radius * Math.sin(degToRad(angle));
    return { x, y };
  };

  const color = value <= 50 ? "#0088FF" : "#EA3434";

  // svg 초기 렌더링
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

  // 기본 회색 배경 원
  const bgCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  bgCircle.setAttribute("cx", String(center));
  bgCircle.setAttribute("cy", String(center));
  bgCircle.setAttribute("r", String(radius));
  bgCircle.setAttribute("fill", "#ccc");
  svg.appendChild(bgCircle);

  // pie path
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", color);
  svg.appendChild(path);

  pieChartCircle.innerHTML = ""; // 기존 내용 비우기
  pieChartCircle.appendChild(svg);

  // 애니메이션
  //   let currentAngle = 0;
  const animationDuration = 1000; // 1초
  const frameRate = 60;
  const totalFrames = (animationDuration / 1000) * frameRate;
  let frame = 0;

  function animatePie() {
    const progress = frame / totalFrames;
    const currentSweep = percentAngle * progress;
    const endAngle = startAngle + currentSweep;

    const { x: x1, y: y1 } = getCoordinates(startAngle);
    const { x: x2, y: y2 } = getCoordinates(endAngle);

    const largeArcFlag = currentSweep > 180 ? 1 : 0;

    const d = `
    M ${center} ${center}
    L ${x1} ${y1}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
    Z
  `;
    path.setAttribute("d", d);

    if (frame < totalFrames) {
      frame++;
      requestAnimationFrame(animatePie);
    }
  }

  // 시작 지연 없이 바로 실행
  setInterval(() => {
    animatePie();
  }, 500);

  const pieChartInnerCircle = CreateElementId("div", "pie-chart-inner-circle");
  pieChartInnerCircle.textContent = `${value}%`;

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

  PushElements(pieChart, [pieChartCircle, pieChartInnerCircle]);

  PushElements(pieChartWrapper, [pieChart]);

  PushElements(panelHader, [pieChartWrapper, closeBtn]);

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
