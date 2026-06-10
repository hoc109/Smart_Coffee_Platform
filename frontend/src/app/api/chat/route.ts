import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// 1. Khai báo interface cho lịch sử tin nhắn để loại bỏ 'any'
interface ChatMessage {
  role: 'user' | 'ai' | string;
  content: string;
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in the environment variables.");
}
// Initialize with dummy key to prevent crash, but API will fail if not real
const genAI = new GoogleGenerativeAI(apiKey || "dummy_key");

export async function POST(req: Request) {
  try {
    const { message, contextData, history } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `
    Bạn là một trợ lý ảo thông minh (AI Assistant) chuyên phân tích dữ liệu kinh doanh cho một quán Cà Phê. 
    Bạn được cung cấp dữ liệu thực tế về doanh thu, các đơn hàng và danh sách sản phẩm từ hệ thống.
    
    Dữ liệu hệ thống hiện tại để bạn tham khảo:
    ${JSON.stringify(contextData)}
    
    Yêu cầu:
    1. Dựa vào dữ liệu trên để trả lời câu hỏi của Quản lý một cách chính xác.
    2. Đưa ra lời khuyên kinh doanh sâu sắc (món nào bán chạy, doanh thu ngày nào thấp, gợi ý combo...).
    3. Trình bày bằng tiếng Việt, ngắn gọn, súc tích, dễ hiểu.
    4. Nếu câu hỏi không liên quan đến quán cà phê hoặc không có trong dữ liệu, hãy lịch sự từ chối hoặc trả lời chung chung.
    `;

    let fullPrompt = systemInstruction + "\n\nLịch sử trò chuyện:\n";
    if (history && history.length > 0) {
      // 2. Sử dụng interface ChatMessage thay cho 'any'
      history.forEach((msg: ChatMessage) => {
        fullPrompt += `${msg.role === 'user' ? 'Quản lý' : 'Trợ lý AI'}: ${msg.content}\n`;
      });
    }

    fullPrompt += `\nQuản lý: ${message}\nTrợ lý AI:`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
  } catch (error: unknown) { 
    // 3. Sử dụng 'unknown' thay vì 'any' trong block catch
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra khi kết nối với AI (Kiểm tra lại GEMINI_API_KEY)" }, { status: 500 });
  }
}