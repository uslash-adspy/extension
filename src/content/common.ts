const CreateElementClassName = <K extends keyof HTMLElementTagNameMap>(
  element: K,
  className: string
) => {
  const createdElement = document.createElement(element);

  createdElement.classList = className;

  return createdElement;
};

const CreateElementId = <K extends keyof HTMLElementTagNameMap>(
  element: K,
  id: string
) => {
  const createdElement = document.createElement(element);

  createdElement.id = id;

  return createdElement;
};

const CreateElement = <K extends keyof HTMLElementTagNameMap>(element: K) => {
  return document.createElement(element);
};

const PushElements = (parent: Element, children: Element[]) => {
  children.forEach((child) => {
    parent.appendChild(child);
  });
};

const GetBody = () => {
  return document.body;
};

let globalIframeContent = "";

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

export {
  CreateElementClassName,
  CreateElementId,
  CreateElement,
  PushElements,
  GetBody,
  extractBlogContent,
};
