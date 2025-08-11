import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { streamingService } from '../../services/streamingService';
import { conversationService } from '../../services/conversationService';
import { authService } from '../../services/authService';
import Header from '../../components/layout/Header';
import ChatWindow from '../../components/chat/ChatWindow';
import MessageInput, { MessageInputHandle } from '../../components/chat/MessageInput';
import CreditBalance from '../../components/dashboard/CreditBalance';
import WorksheetGeneratorModal from '../../components/chat/WorksheetGeneratorModal';
import WorksheetDisplay from '../../components/chat/WorksheetDisplay';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ComposerToolbar from '../../components/chat/ComposerToolbar';
import CommandPalette from '../../components/chat/CommandPalette';
import { ChatMessage, Conversation } from '../../types';
import { AlertCircle, ArrowLeft, Plus, FileText, Menu } from 'lucide-react';
import Button from '../../components/ui/Button';
import { generateUUID } from '../../utils/uuid';

const ChatPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<any>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [showSidebar] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const composerRef = useRef<MessageInputHandle | null>(null);

  // Load conversation history from localStorage
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    const savedMessages = localStorage.getItem('chatMessages');
    
    if (savedSessionId && savedMessages) {
      setSessionId(savedSessionId);
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    } else {
      // Generate a new session ID for this chat session
      const newSessionId = generateUUID();
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Keyboard shortcuts: Ctrl/Cmd + K to open palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      if (isCmdK) {
        e.preventDefault();
        setIsCmdPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    const userMessage: ChatMessage = {
      id: generateUUID(),
      content,
      isUser: true,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError('');

    // Create a pending AI message
    const aiMessageId = generateUUID();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: '',
      isUser: false,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      await streamingService.sendMessageStream(content, sessionId, currentConversation?.id, {
        onStart: () => {
          // AI is starting to respond
        },
        onChunk: (content: string) => {
          // Update the AI message with new content
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: msg.content + content }
                : msg
            )
          );
        },
        onEnd: (metadata) => {
          // Update user credits and finalize the message
          updateUser({ ...user, credits_balance: metadata.credits_balance });
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, session_id: metadata.session_id }
                : msg
            )
          );
        },
        onError: (message: string) => {
          setError(message);
          // Remove the pending AI message on error
          setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
        }
      });
    } catch (err: any) {
      if (err.message?.includes('402')) {
        setError('Nemáte dostatek kreditů pro odeslání zprávy. Prosím, doplňte kredity.');
      } else {
        setError(err.message || 'Nepodařilo se odeslat zprávu');
      }
      // Remove the pending AI message on error
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    const newSessionId = generateUUID();
    setSessionId(newSessionId);
    localStorage.setItem('chatSessionId', newSessionId);
  };

  const startNewChat = async () => {
    try {
      const newConversation = await conversationService.createConversation({
        title: 'New Conversation',
        assistant_type: 'math_assistant'
      });
      
      setCurrentConversation(newConversation);
      setMessages([]);
      setSessionId(newConversation.id);
      localStorage.setItem('chatSessionId', newConversation.id);
      localStorage.removeItem('chatMessages');
      
      showToast({ type: 'success', message: 'Nová konverzace byla vytvořena' });
    } catch (error) {
      console.error('Failed to create new conversation:', error);
      showToast({ type: 'error', message: 'Nepodařilo se vytvořit novou konverzaci' });
    }
  };

  const handleConversationSelect = async (conversationId: string) => {
    try {
      const conversation = await conversationService.getConversation(conversationId);
      setCurrentConversation(conversation);
      setSessionId(conversationId);
      localStorage.setItem('chatSessionId', conversationId);
      
      // Convert database messages to chat messages
      const chatMessages: ChatMessage[] = conversation.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.role === 'user',
        timestamp: msg.created_at,
        session_id: conversationId
      }));
      
      setMessages(chatMessages);
      localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    } catch (error) {
      console.error('Failed to load conversation:', error);
      showToast({ type: 'error', message: 'Nepodařilo se načíst konverzaci' });
    }
  };

  const handleGenerateWorksheet = async (topic: string) => {
    try {
      setIsGeneratingWorksheet(true);
      
      await streamingService.generateWorksheetStream(topic, {
        onStart: () => {
          // Worksheet generation is starting
        },
        onChunk: (_content: string) => {
          // Optional: You could show progress here if needed
        },
        onEnd: (metadata) => {
          setGeneratedWorksheet(metadata.worksheet);
          updateUser({ ...user, credits_balance: metadata.credits_balance });
          showToast({ type: 'success', message: `Cvičení vygenerováno! Použito ${metadata.credits_used} kreditů.` });
          setIsWorksheetModalOpen(false);
        },
        onError: (message: string) => {
          showToast({ type: 'error', message: message });
        }
      });
    } catch (error: any) {
      console.error('Failed to generate worksheet:', error);
      if (error.message?.includes('402')) {
        showToast({ type: 'error', message: 'Nemáte dostatek kreditů pro generování cvičení. Potřebujete 2 kredity.' });
      } else {
        showToast({ type: 'error', message: 'Nepodařilo se vygenerovat cvičení. Zkuste to prosím znovu.' });
      }
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  const handleAddCreditsShortcut = async () => {
    try {
      const result = await authService.addDemoCredits();
      updateUser(result.user);
      showToast({ type: 'success', message: `Přidáno ${result.credits_added} demo kreditů!` });
    } catch (e) {
      showToast({ type: 'error', message: 'Nepodařilo se přidat kredity.' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background dark:bg-neutral-900">
      <Header />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - desktop */}
        {showSidebar && (
          <div className="hidden md:block">
            <ChatSidebar
              onConversationSelect={handleConversationSelect}
              onNewConversation={startNewChat}
              selectedConversationId={currentConversation?.id}
            />
          </div>
        )}
        {/* Sidebar - mobile drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-80 bg-card dark:bg-neutral-950 shadow-2xl">
              <ChatSidebar
                onConversationSelect={(id) => {
                  handleConversationSelect(id);
                  setIsMobileSidebarOpen(false);
                }}
                onNewConversation={() => {
                  startNewChat();
                  setIsMobileSidebarOpen(false);
                }}
                selectedConversationId={currentConversation?.id}
              />
            </div>
          </div>
        )}
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header with back button and credit balance */}
          <div className="flex items-center justify-between p-4 border-b border-border dark:border-neutral-800 bg-card dark:bg-neutral-950">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted dark:hover:bg-neutral-800"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Zpět na dashboard</span>
              </Button>
              <h1 className="text-xl font-bold text-foreground dark:text-neutral-100">
                AI Asistent
              </h1>
              {currentConversation && (
                <span className="text-sm text-muted-foreground dark:text-neutral-300">
                  - {currentConversation.title}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <CreditBalance />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsWorksheetModalOpen(true)}
                className="flex items-center space-x-2 text-success-700 hover:text-success-800"
                disabled={user.credits_balance < 2}
              >
                <FileText className="h-4 w-4" />
                <span>Vygenerovat cvičení</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={startNewChat}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Plus className="h-4 w-4" />
                <span>Nový chat</span>
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearChatHistory}
                  className="text-danger-600 hover:text-danger-700"
                >
                  Vymazat historii
                </Button>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-4 mt-4 flex items-center space-x-2 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-md">
              <AlertCircle className="h-5 w-5 text-danger-500" />
              <span className="text-sm text-danger-700 dark:text-danger-400">{error}</span>
            </div>
          )}

          {/* Chat container */}
          <div className="flex-1 min-h-0 bg-card dark:bg-neutral-950 border border-border dark:border-neutral-800 rounded-lg shadow-soft mx-4 my-4 flex flex-col">
            <ChatWindow 
              messages={messages} 
              onCopyMessage={handleCopyMessage}
              copiedMessageId={copiedMessageId}
              isTyping={isLoading}
            />
            <ComposerToolbar
              onGenerateWorksheet={() => setIsWorksheetModalOpen(true)}
              disabled={user.credits_balance < 2}
              onInsertText={(text) => composerRef.current?.insertText(text)}
              onOpenHelp={() => setIsCmdPaletteOpen(true)}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              disabled={user.credits_balance < 1}
              disabledReason={user.credits_balance < 1 ? 'Nemáte dostatek kreditů' : undefined}
              ref={composerRef}
            />
          </div>

          {/* Credit warning */}
          {user.credits_balance < 1 && (
            <div className="mx-4 mb-4 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-warning-600" />
                <span className="text-sm text-warning-800 dark:text-warning-400">
                  Nemáte dostatek kreditů pro odeslání zprávy. Každá zpráva stojí 1 kredit.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Worksheet Generator Modal */}
      <WorksheetGeneratorModal
        isOpen={isWorksheetModalOpen}
        onClose={() => setIsWorksheetModalOpen(false)}
        onGenerate={handleGenerateWorksheet}
        isLoading={isGeneratingWorksheet}
      />

      {/* Worksheet Display Modal */}
      {generatedWorksheet && (
        <WorksheetDisplay
          worksheet={generatedWorksheet}
          onClose={() => setGeneratedWorksheet(null)}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        onNewChat={startNewChat}
        onGoMaterials={() => navigate('/materials')}
        onAddCredits={handleAddCreditsShortcut}
        onFocusComposer={() => composerRef.current?.focus()}
      />
    </div>
  );
};

export default ChatPage; 