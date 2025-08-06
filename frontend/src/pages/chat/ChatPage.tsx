import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { assistantService } from '../../services/assistantService';
import Header from '../../components/layout/Header';
import ChatWindow from '../../components/chat/ChatWindow';
import MessageInput from '../../components/chat/MessageInput';
import CreditBalance from '../../components/dashboard/CreditBalance';
import { ChatMessage } from '../../types';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();

  useEffect(() => {
    // Generate a session ID for this chat session
    setSessionId(crypto.randomUUID());
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      isUser: true,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError('');

    try {
      const response = await assistantService.sendMessage(content, sessionId);
      
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: response.response,
        isUser: false,
        timestamp: new Date().toISOString(),
        session_id: response.session_id,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      if (err.response?.status === 402) {
        setError('Nemáte dostatek kreditů pro odeslání zprávy. Prosím, doplňte kredity.');
      } else {
        setError(err.message || 'Nepodařilo se odeslat zprávu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button and credit balance */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zpět na dashboard</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              AI Asistent
            </h1>
          </div>
          <CreditBalance />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Chat container */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-[600px] flex flex-col">
          <ChatWindow messages={messages} />
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={user.credits_balance < 1}
          />
        </div>

        {/* Credit warning */}
        {user.credits_balance < 1 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-yellow-700">
                Nemáte dostatek kreditů pro odeslání zprávy. Každá zpráva stojí 1 kredit.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 