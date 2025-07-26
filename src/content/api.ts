const ANALYZE_API = "https://5a6659b6cef6.ngrok-free.app";
const CHAT_API = "https://ae4038d76e36.ngrok-free.app";

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
}

export async function analyzeCurrentPage(content: string): Promise<AnalysisResult | null> {
  try {
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

export async function sendChatMessage(
  _userMessage: string,
  chatHistory: ChatMessage[],
  content: string
): Promise<string> {
  try {
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