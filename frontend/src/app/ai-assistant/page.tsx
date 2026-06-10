"use client";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';

// 1. Định nghĩa các interface để loại bỏ hoàn toàn 'any'
interface Product {
  name: string;
  price: number;
  category: {
    name: string;
  };
}

interface Order {
  status: string;
  totalAmount: number;
  createdAt: string;
}

interface ContextData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  ordersDetails: { date: string; total: number }[];
  products: { name: string; price: number; category: string }[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Xin chào! Tôi là Trợ lý ảo AI của Coffee Chill. Tôi có thể phân tích doanh thu, tồn kho và tư vấn chiến lược kinh doanh cho bạn. Bạn muốn tôi giúp gì hôm nay?' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Sử dụng interface ContextData thay vì 'any'
  const [contextData, setContextData] = useState<ContextData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          axiosInstance.get("/orders"),
          axiosInstance.get("/products?size=100")
        ]);

        // 3. Sử dụng interface Order và Product thay cho 'any'
        const paidOrders = ordersRes.data.filter((o: Order) => o.status === "PAID");
        const totalRev = paidOrders.reduce((sum: number, o: Order) => sum + o.totalAmount, 0);

        setContextData({
          totalRevenue: totalRev,
          totalOrders: paidOrders.length,
          totalProducts: productsRes.data.content?.length || 0,
          ordersDetails: paidOrders.map((o: Order) => ({
            date: o.createdAt,
            total: o.totalAmount
          })),
          products: productsRes.data.content?.map((p: Product) => ({
            name: p.name,
            price: p.price,
            category: p.category.name
          }))
        });
      } catch (err) {
        console.error("Failed to fetch context data", err);
      }
    };
    fetchContext();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          contextData: contextData,
          history: messages
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch {
      // 4. Lược bỏ '(err: any)' vì không sử dụng đến
      setMessages(prev => [...prev, { role: 'ai', content: "Xin lỗi, đã có lỗi xảy ra. Hãy kiểm tra lại kết nối hoặc đảm bảo bạn đã thêm biến môi trường **GEMINI_API_KEY** trong file `.env.local` của Frontend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-amber-500/10 to-transparent flex items-center gap-3">
        <div className="bg-amber-500 p-2 rounded-xl text-slate-900 shadow-lg shadow-amber-500/20">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Trợ lý AI Kinh doanh</h2>
          <p className="text-sm text-slate-500 font-medium">Tích hợp Google Gemini để phân tích dữ liệu thực tế</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-amber-500 text-slate-900'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`px-5 py-3.5 rounded-2xl max-w-[75%] ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm bg-amber-500 text-slate-900">
              <Bot size={20} />
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-amber-500" size={18} />
              <span className="text-sm font-medium">Trợ lý đang suy nghĩ và phân tích dữ liệu...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-3 relative">
          <input
            type="text"
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all pr-14"
            placeholder="Bạn muốn hỏi gì về tình hình kinh doanh của quán?"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:text-slate-500 text-slate-900 rounded-lg transition-colors shadow-sm disabled:shadow-none"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}