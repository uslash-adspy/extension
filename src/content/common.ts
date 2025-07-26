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
let cachedAnalysisResult: any = null;

function parseNaverBlogUrl() {
  const url = window.location.href;

  const patterns = [
    /blogId=([^&]+).*logNo=(\d+)/,
    /blog\.naver\.com\/([^\/]+)\/(\d+)/,
    /m\.blog\.naver\.com\/([^\/]+)\/(\d+)/,
    /blog\.naver\.com\/([^\/]+)\/(\d+)\?.*/,
    /blog\.naver\.com\/([^\/]+)\/(\d+)#.*/,
    /m\.blog\.naver\.com\/([^\/]+)\/(\d+)\?.*/,
    /m\.blog\.naver\.com\/([^\/]+)\/(\d+)#.*/,
  ];

  let urlMatch = null;
  for (const pattern of patterns) {
    urlMatch = url.match(pattern);
    if (urlMatch) break;
  }

  if (!urlMatch) return null;

  const blogId = urlMatch[1];
  const logNo = urlMatch[2];
  const analysisKey = `adspy-analysis-${blogId}-${logNo}`;
  const chatKey = `adspy-chat-${blogId}-${logNo}`;

  return {
    blogId,
    logNo,
    cleanUrl: `https://blog.naver.com/${blogId}/${logNo}`,
    analysisKey,
    chatKey,
  };
}

function extractBlogContent(): string {
  if (globalIframeContent.length > 50) {
    return globalIframeContent;
  }

  let content = "";

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

  return content.substring(0, 3000);
}

const setCachedAnalysisResult = (result: any) => {
  cachedAnalysisResult = result;
};

const getCachedAnalysisResult = () => {
  return cachedAnalysisResult;
};

export {
  CreateElementClassName,
  CreateElementId,
  CreateElement,
  PushElements,
  GetBody,
  extractBlogContent,
  setCachedAnalysisResult,
  getCachedAnalysisResult,
  parseNaverBlogUrl,
};
