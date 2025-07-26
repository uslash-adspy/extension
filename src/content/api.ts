import { parseNaverBlogUrl } from "./common";

const API_CONFIG = {
  ANALYZE_API: "https://3aaab2e17f40.ngrok-free.app",
  CHAT_API: "https://6fc192b59420.ngrok-free.app",
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export interface AnalysisResult {
  category: string;
  isAd: boolean;
  backAdPercentage: number;
  adProbability: number;
  adUrls: string[];
  comment: string;
}

export interface ChatMessage {
  content: string;
  type: "user" | "bot";
  timestamp: number;
  result?: string | null;
}

export interface ChatResponse {
  content: string;
  result: string | null;
}

async function retryRequest<T>(
  requestFn: () => Promise<T>,
  attempts: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, API_CONFIG.RETRY_DELAY * (i + 1))
      );
    }
  }
  throw new Error("Max retry attempts reached");
}

export async function analyzeCurrentPage(
  content: string
): Promise<AnalysisResult | null> {
  try {
    const urlInfo = parseNaverBlogUrl();
    const cleanUrl = urlInfo ? urlInfo.cleanUrl : window.location.href;

    return await retryRequest(async () => {
      const response = await fetch(`${API_CONFIG.ANALYZE_API}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          url: cleanUrl,
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `분석 요청 실패: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    });
  } catch (error) {
    return null;
  }
}

export async function sendChatMessage(
  _userMessage: string,
  chatHistory: ChatMessage[],
  content: string
): Promise<ChatResponse> {
  try {
    const urlInfo = parseNaverBlogUrl();
    const cleanUrl = urlInfo ? urlInfo.cleanUrl : window.location.href;

    const chat = chatHistory.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    return await retryRequest(async () => {
      const response = await fetch(`${API_CONFIG.CHAT_API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          url: cleanUrl,
          chat: chat,
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `채팅 요청 실패: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    });
  } catch (error) {
    return {
      content: "죄송합니다. 응답을 생성할 수 없습니다.",
      result: null,
    };
  }
}
