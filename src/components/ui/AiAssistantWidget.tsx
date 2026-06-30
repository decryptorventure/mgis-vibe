import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui-kit-compat';
import { cn } from '@frontend-team/ui-kit';
import { Bot, Send, Sparkles, ChevronDown } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actions?: { label: string; onClick: () => void }[];
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'ai',
    text: 'Xin chào! Tôi là MGIS AI Assistant. Tôi có thể giúp bạn phân tích dữ liệu, tìm nguyên nhân giảm ROAS, hoặc tự động hóa chiến dịch. Bạn cần giúp gì hôm nay?'
  },
  {
    id: '2',
    sender: 'ai',
    text: 'Cảnh báo: Chiến dịch "Meta_US_LAL_Install" đang có CPA ($2.55) vượt ngưỡng mục tiêu ($2.00). Bạn có muốn tôi tạm dừng chiến dịch này không?',
    actions: [
      { label: 'Pause now', onClick: () => {} },
      { label: 'Lower bid 20%', onClick: () => {} }
    ]
  }
];

export const AiAssistantWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Mock AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Tôi đã phân tích yêu cầu của bạn. Dự báo tuần tới chi phí sẽ giảm 15% nếu bạn duy trì mức thầu hiện tại.'
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button — floating layer: shadow allowed per Core DS */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 radius_round flex items-center justify-center cursor-pointer transition-transform hover:scale-105 z-50 border-0 bg_info_contrast fg_on_contrast shadow-xl"
          aria-label="Open AI Assistant"
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Panel — floating layer: shadow allowed per Core DS */}
      {open && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[500px] radius_16 flex flex-col z-50 overflow-hidden animate-slideUp bg_primary border border_primary shadow-xl">
          {/* Header */}
          <div className="p-4 flex justify-between items-center shrink-0 bg_info_contrast fg_on_contrast">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 radius_round state_bg_button_tertiary_soft flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <div className="font-bold text-sm">MGIS AI Assistant</div>
                <div className="text-[10px] opacity-80">Powered by Agentic AI</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center radius_round hover:state_bg_button_tertiary_soft border-0 bg-transparent cursor-pointer transition-colors"
                aria-label="Close AI Assistant"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg_canvas_secondary">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 radius_round flex items-center justify-center shrink-0 mt-1 bg_blue_subtle">
                    <Sparkles size={12} className="fg_blue_accent" />
                  </div>
                )}

                <div className="max-w-[80%] flex flex-col gap-1.5">
                  <div
                    className={cn(
                      'p-3 radius_16 text-[13px] leading-relaxed',
                      msg.sender === 'user'
                        ? 'rounded-tr-sm bg_info_contrast fg_on_contrast'
                        : 'rounded-tl-sm bg_primary border border_primary text_primary',
                    )}
                  >
                    {msg.text}
                  </div>

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {msg.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={action.onClick}
                          className="text-xs font-semibold px-3 py-1.5 radius_8 cursor-pointer transition-colors text-left bg_primary border border_blue fg_blue_accent hover:state_bg_blue_medium"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 shrink-0 bg_primary border-t border_secondary">
            <div className="relative flex items-center">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onPressEnter={handleSend}
                placeholder="Hỏi AI về chiến dịch, ROAS..."
                className="pr-10 rounded-xl h-10"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={cn(
                  'absolute right-1 w-8 h-8 flex items-center justify-center radius_8 border-0 cursor-pointer disabled:cursor-not-allowed transition-colors fg_on_contrast',
                  inputValue.trim() ? 'bg_info_contrast hover:state_bg_blue_medium' : 'bg_tertiary',
                )}
                aria-label="Send message"
              >
                <Send size={14} className="ml-[-2px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistantWidget;
