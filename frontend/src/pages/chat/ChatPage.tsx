import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { generateUUID } from '../../utils/uuid';
import { MathTopic, MathDifficulty, PracticeSession } from '../../types';
import { api } from '../../services/apiClient';
import { streamingService } from '../../services/streamingService';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatWindow from '../../components/chat/ChatWindow';
import MessageInput from '../../components/chat/MessageInput';
import ComposerToolbar from '../../components/chat/ComposerToolbar';
import CommandPalette from '../../components/chat/CommandPalette';
import WorksheetGeneratorModal from '../../components/chat/WorksheetGeneratorModal';
import ImageUploadModal from '../../components/chat/ImageUploadModal';
import ChatTemplates from '../../components/chat/ChatTemplates';
import VoiceInput from '../../components/chat/VoiceInput';
import Button from '../../components/ui/Button';
import Tooltip from '../../components/ui/Tooltip';
import { AlertCircle, Menu, Calculator, X, Download, BookOpen } from 'lucide-react';
import { PDFExporter, ConversationExportData } from '../../utils/pdfExport';
import MathToolsToolbar from '../../components/chat/MathToolsToolbar';
import DifficultyProgression from '../../components/chat/DifficultyProgression';
import PracticeMode from '../../components/chat/PracticeMode';
import WorksheetDisplay from '../../components/chat/WorksheetDisplay';
import Header from '../../components/layout/Header';

const ChatPage: React.FC = () => {
  console.log('ChatPage: Component is rendering'); // Debug log
  
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  console.log('ChatPage: Auth context loaded, user:', user); // Debug log
  console.log('ChatPage: Toast context loaded:', showToast); // Debug log
  console.log('ChatPage: Navigate function loaded:', navigate); // Debug log
  
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<any>(null);
  const [currentConversation, setCurrentConversation] = useState<any | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  
  // Phase 13.1: Math Assistant State
  const [selectedMathTopic, setSelectedMathTopic] = useState<MathTopic>('basic_math');
  const [selectedDifficulty, setSelectedDifficulty] = useState<MathDifficulty>('basic');
  const [showMathTools, setShowMathTools] = useState(false);
  const [showPracticeMode, setShowPracticeMode] = useState(false);
  const [showDifficultyProgression, setShowDifficultyProgression] = useState(false);
  const [userMathProgress, setUserMathProgress] = useState<Record<MathTopic, number>>({
    basic_math: 75,
    algebra: 60,
    geometry: 45,
    calculus: 30,
    statistics: 40,
    discrete_math: 35,
    physics: 50,
    chemistry: 55,
    biology: 65,
    history: 80,
    czech_language: 85,
    other: 70
  });
  
  const composerRef = useRef<any | null>(null);

  // Global keyboard shortcut handler
  const handleGlobalShortcut = (shortcutId: string) => {
    console.log('🎯 ChatPage: Global shortcut triggered:', shortcutId);
    console.log('🎯 ChatPage: Current state - messages:', messages.length, 'sessionId:', sessionId);
    
    switch (shortcutId) {
      case 'new-chat':
        console.log('🎯 ChatPage: Starting new chat');
        startNewChat();
        break;
      case 'focus-composer':
        console.log('🎯 ChatPage: Focusing composer');
        composerRef.current?.focus();
        break;
      case 'send-message':
        console.log('🎯 ChatPage: Focusing composer for send');
        // Focus composer and let user press Enter
        composerRef.current?.focus();
        break;
      case 'dashboard':
        console.log('🎯 ChatPage: Navigating to dashboard');
        navigate('/dashboard');
        break;
      case 'help':
        console.log('🎯 ChatPage: Help shortcut - handled by global system');
        // This will be handled by the global help system
        break;
      case 'shortcuts':
        console.log('🎯 ChatPage: Shortcuts shortcut - handled by global system');
        // This will be handled by the global shortcuts system
        break;
      case 'toggle-theme':
        console.log('🎯 ChatPage: Theme toggle - handled by global system');
        // This will be handled by the global theme system
        break;
      case 'high-contrast':
        console.log('🎯 ChatPage: High contrast - handled by global system');
        // This will be handled by the global accessibility system
        break;
      default:
        console.log('🎯 ChatPage: Unhandled shortcut:', shortcutId);
        break;
    }
  };

  // Keyboard shortcuts for this page
  const shortcuts = [
    { id: 'new-chat', name: 'Nový chat', description: 'Vytvořit novou konverzaci', defaultKey: 'Ctrl+N', currentKey: 'Ctrl+N', category: 'chat' as const },
    { id: 'focus-composer', name: 'Zaměřit kompozitor', description: 'Přesunout kurzor do vstupního pole', defaultKey: 'Ctrl+L', currentKey: 'Ctrl+L', category: 'chat' as const },
    { id: 'send-message', name: 'Odeslat zprávu', description: 'Odeslat zprávu v chatu', defaultKey: 'Ctrl+Enter', currentKey: 'Ctrl+Enter', category: 'chat' as const },
    { id: 'dashboard', name: 'Dashboard', description: 'Přejít na dashboard', defaultKey: 'Ctrl+D', currentKey: 'Ctrl+D', category: 'navigation' as const },
    { id: 'help', name: 'Nápověda', description: 'Otevřít nápovědu', defaultKey: 'F1', currentKey: 'F1', category: 'general' as const },
    { id: 'shortcuts', name: 'Klávesové zkratky', description: 'Otevřít nastavení zkratek', defaultKey: 'Ctrl+/', currentKey: 'Ctrl+/', category: 'general' as const },
    { id: 'toggle-theme', name: 'Přepnout téma', description: 'Přepnout mezi světlým a tmavým režimem', defaultKey: 'Ctrl+T', currentKey: 'Ctrl+T', category: 'general' as const },
    { id: 'high-contrast', name: 'Vysoký kontrast', description: 'Přepnout vysoký kontrast', defaultKey: 'Ctrl+H', currentKey: 'Ctrl+H', category: 'accessibility' as const }
  ];

  // Use global keyboard shortcuts
  useKeyboardShortcuts(shortcuts, handleGlobalShortcut);

  // Load conversation history from localStorage
  useEffect(() => {
    console.log('ChatPage: useEffect for localStorage is running'); // Debug log
    const savedSessionId = localStorage.getItem('chatSessionId');
    const savedMessages = localStorage.getItem('chatMessages');
    
    console.log('ChatPage: Saved session ID:', savedSessionId); // Debug log
    console.log('ChatPage: Saved messages:', savedMessages); // Debug log
    
    if (savedSessionId && savedMessages) {
      setSessionId(savedSessionId);
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        console.log('ChatPage: Messages loaded from localStorage:', parsedMessages); // Debug log
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    } else {
      // Generate a new session ID for this chat session
      const newSessionId = generateUUID();
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      console.log('ChatPage: New session ID generated:', newSessionId); // Debug log
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Enhanced keyboard shortcuts - now using global system
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only handle shortcuts that are specific to this page
      // Global shortcuts are handled by the useKeyboardShortcuts hook
      
      // Ctrl/Cmd + K to open command palette (page-specific)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        console.log('ChatPage: Command palette shortcut triggered');
        e.preventDefault();
        e.stopPropagation();
        setIsCmdPaletteOpen(true);
      }

      // Ctrl/Cmd + Enter to send message (when composer is focused)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        console.log('ChatPage: Send message shortcut triggered');
        e.preventDefault();
        e.stopPropagation();
        // Focus the composer and let the user press Enter to send
        composerRef.current?.focus();
      }
    };
    
    // Use capture phase to handle page-specific shortcuts before global ones
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    const userMessage: any = {
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
    const aiMessage: any = {
      id: aiMessageId,
      content: '',
      isUser: false,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Ensure we have a conversation id
      let conversationId = currentConversation?.id as string | undefined;
      if (!conversationId) {
        const resp = await api.post('/conversations', {
          title: 'New Conversation',
          assistant_type: 'math_assistant'
        });
        const conv = (resp.data as any).data;
        setCurrentConversation(conv);
        const convId: string = conv.id;
        conversationId = convId;
        setSessionId(convId);
        localStorage.setItem('chatSessionId', convId);
        localStorage.removeItem('chatMessages');
      }

      // Stream AI response
      await streamingService.sendMessageStream(
        content,
        sessionId,
        conversationId,
        {
          onChunk: (chunk) => {
            setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: (m.content || '') + chunk } : m));
          },
          onEnd: ({ credits_balance }) => {
            if (user) {
              updateUser({ ...user, credits_balance });
            }
          },
          onError: (msg) => {
            setError(msg);
            setMessages(prev => prev.filter(m => m.id !== aiMessageId));
          }
        }
      );
    } catch (err: any) {
      if (err.response?.status === 402) {
        setError('Nemáte dostatek kreditů pro odeslání zprávy. Prosím, doplňte kredity.');
      } else {
        setError(err.response?.data?.message || 'Nepodařilo se odeslat zprávu');
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

  const startNewChat = async () => {
    try {
      const newConversation = await api.post('/conversations', {
        title: 'New Conversation',
        assistant_type: 'math_assistant'
      });

      const conv = (newConversation.data as any).data;
      setCurrentConversation(conv);
      setMessages([]);
      setError('');
      setGeneratedWorksheet(null);
      setSessionId(conv.id);
      localStorage.setItem('chatSessionId', conv.id);
      localStorage.removeItem('chatMessages');
      
      showToast({ type: 'success', message: 'Nová konverzace vytvořena!' });
    } catch (error) {
      console.error('Error creating new conversation:', error);
      setError('Nepodařilo se vytvořit novou konverzaci');
    }
  };

  const handleConversationSelect = async (conversationId: string) => {
    try {
      const conversation = await api.get(`/conversations/${conversationId}`);
      const conv = (conversation.data as any).data;
      if (conv) {
        setCurrentConversation(conv);
        setSessionId(conversationId);
        localStorage.setItem('chatSessionId', conversationId);
        
        // Convert database messages to chat messages
        const chatMessages: any[] = (conv as any).messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: msg.created_at,
          session_id: conversationId
        }));
        
        setMessages(chatMessages);
        setError('');
        setGeneratedWorksheet(null);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setError('Nepodařilo se načíst konverzaci');
    }
  };

  const handleGenerateWorksheet = async (topic: string) => {
    if (!currentConversation) {
      showToast({ type: 'error', message: 'Nejprve začněte konverzaci' });
      return;
    }

    setIsGeneratingWorksheet(true);
    try {
      const response = await api.post(`/conversations/${currentConversation?.id}/worksheets`, {
        topic: topic,
        difficulty: selectedDifficulty,
      });
      const worksheet = response.data;
      setGeneratedWorksheet(worksheet);
      updateUser({ ...user, credits_balance: (response.data as any).credits_balance });
      showToast({ 
        type: 'success', 
        message: `Cvičení vygenerováno! Použito ${(response.data as any).credits_used} kreditů.` 
      });
    } catch (error) {
      showToast({ type: 'error', message: 'Nepodařilo se vygenerovat cvičení' });
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  const handleAddCreditsShortcut = async () => {
    try {
      const result = await api.post('/users/add_demo_credits');
      updateUser((result.data as any).user);
      showToast({ type: 'success', message: `Přidáno ${(result.data as any).credits_added} demo kreditů!` });
    } catch (error) {
      showToast({ type: 'error', message: 'Nepodařilo se přidat kredity' });
    }
  };

  // Phase 13.1: Math Assistant Handlers
  const handleMathTopicChange = (topic: MathTopic) => {
    setSelectedMathTopic(topic);
    // Update difficulty based on user progress
    const progress = userMathProgress[topic];
    if (progress >= 90) {
      setSelectedDifficulty('advanced');
    } else if (progress >= 70) {
      setSelectedDifficulty('intermediate');
    } else {
      setSelectedDifficulty('basic');
    }
  };

  const handleDifficultyChange = (difficulty: MathDifficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const handleStartPractice = () => {
    setShowPracticeMode(true);
    setShowMathTools(false);
  };

  const handleShowProgression = () => {
    setShowDifficultyProgression(true);
    setShowMathTools(false);
  };

  const handlePracticeComplete = (session: PracticeSession) => {
    // Update user progress based on practice results
    const scorePercentage = (session.score / session.totalProblems) * 100;
    const currentProgress = userMathProgress[session.topic];
    const newProgress = Math.min(100, currentProgress + (scorePercentage * 0.1)); // Small progress boost
    
    setUserMathProgress(prev => ({
      ...prev,
      [session.topic]: newProgress
    }));

    showToast({
      type: 'success',
      message: `Cvičení dokončeno! Skóre: ${session.score}/${session.totalProblems} (${Math.round(scorePercentage)}%)`
    });
    
    setShowPracticeMode(false);
    setShowMathTools(true);
  };

  const handleClosePractice = () => {
    setShowPracticeMode(false);
    setShowMathTools(true);
  };

  // Image upload handlers
  const handleImageUpload = () => {
    setIsImageUploadOpen(true);
  };

  const handleImageProcessed = (text: string, _imageUrl: string) => {
    // Insert the OCR text into the message input
    if (composerRef.current) {
      composerRef.current.insertText(`Obrázek matematického problému:\n${text}\n\nProsím pomozte mi s tímto příkladem.`);
    }
    
    // You could also automatically send the message or add it as a special message type
    showToast({ type: 'success', message: 'Obrázek byl zpracován a text vložen do chatu' });
  };

  const handleExportConversation = async () => {
    try {
      const exportData: ConversationExportData = {
        title: currentConversation?.title || 'Nová konverzace',
        messages: messages.map(msg => ({
          content: msg.content,
          isUser: msg.isUser,
          timestamp: msg.timestamp
        })),
        date: new Date().toISOString()
      };

      await PDFExporter.exportConversation(exportData);
      showToast({ type: 'success', message: 'Konverzace byla exportována do PDF' });
    } catch (error) {
      console.error('Error exporting conversation:', error);
      showToast({ type: 'error', message: 'Nepodařilo se exportovat konverzaci' });
    }
  };

  const handleVoiceTranscript = (text: string) => {
    if (composerRef.current) {
      composerRef.current.insertText(text);
    }
    showToast({ type: 'success', message: 'Hlasový vstup byl přidán do chatu' });
  };

  const handleVoiceError = (error: string) => {
    showToast({ type: 'error', message: error });
  };

  const handleTemplateSelect = (template: any) => { // Changed to any as ChatTemplate is removed
    if (composerRef.current) {
      composerRef.current.insertText(template.prompt);
    }
    showToast({ type: 'success', message: `Šablona "${template.title}" byla přidána do chatu` });
  };

  // Add missing handlers
  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleRegenerateMessage = (messageId: string) => {
    // Find the message to regenerate
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0) {
      // Remove the AI message and regenerate
      const userMessage = messages[messageIndex - 1];
      setMessages(prev => prev.slice(0, messageIndex));
      handleSendMessage(userMessage.content);
    }
  };

  if (!user) {
    console.log('ChatPage: No user, returning null'); // Debug log
    return null;
  }

  console.log('ChatPage: User authenticated, rendering main content'); // Debug log
  console.log('ChatPage: Current state - messages:', messages.length, 'isLoading:', isLoading, 'error:', error); // Debug log

  try {
    console.log('ChatPage: Starting to render JSX'); // Debug log
    return (
      <div className="min-h-screen bg-background dark:bg-neutral-900">
        <Header />
        
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <ChatSidebar
            onConversationSelect={handleConversationSelect}
            onNewConversation={startNewChat}
            selectedConversationId={currentConversation?.id}
          />
          
          {/* Sidebar - mobile drawer */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="fixed inset-0 bg-neutral-900/60" onClick={() => setIsMobileSidebarOpen(false)} />
              <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Konverzace</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      title="Zpět na dashboard"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Button>
                    <Button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      variant="secondary"
                      size="icon"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ChatSidebar
                  onConversationSelect={(conversationId) => {
                    handleConversationSelect(conversationId);
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
          
          {/* Chat Interface */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-neutral-800 bg-card dark:bg-neutral-950">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  variant="secondary"
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Tooltip content="Hlavní rozhraní pro komunikaci s AI asistentkou">
                  <h1 className="text-xl font-semibold text-foreground dark:text-neutral-100">
                    Matematický Asistent
                  </h1>
                </Tooltip>
              </div>
              
              <div className="flex items-center gap-3">
              {/* Dashboard Button */}
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                title="Zpět na dashboard"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Button>
              
              {/* Templates Button */}
              <Button
                onClick={() => setIsTemplatesOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                title="Otevřít šablony konverzací"
              >
                <BookOpen className="h-4 w-4" />
                Šablony
              </Button>
              
              {/* Export Button */}
              <Button
                onClick={handleExportConversation}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={messages.length === 0}
                title="Exportovat konverzaci do PDF"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              
              {/* Math Tools Button */}
              <Tooltip content="Zobrazit nebo skrýt matematické nástroje a cvičení">
                <Button
                  onClick={() => setShowMathTools(!showMathTools)}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  {showMathTools ? 'Skrýt' : 'Nástroje'}
                </Button>
              </Tooltip>
              
              {/* Credit Balance */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Kredity:</span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{user.credits_balance}</span>
              </div>
            </div>
            </div>

            {/* Math Tools Toolbar */}
            {showMathTools && (
              <div className="border-b border-border dark:border-neutral-800 bg-card dark:bg-neutral-950">
                <MathToolsToolbar
                  selectedTopic={selectedMathTopic}
                  selectedDifficulty={selectedDifficulty}
                  onTopicChange={handleMathTopicChange}
                  onDifficultyChange={handleDifficultyChange}
                  onStartPractice={handleStartPractice}
                  onShowProgression={handleShowProgression}
                  className="mx-4 my-4"
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mx-4 mt-4 flex items-center gap-2 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-md">
                <AlertCircle className="h-5 w-5 text-danger-500" />
                <span className="text-sm text-danger-700 dark:text-danger-400">{error}</span>
              </div>
            )}

            {/* Practice Mode */}
            {showPracticeMode && (
              <div className="flex-1 overflow-y-auto">
                <PracticeMode
                  topic={selectedMathTopic}
                  difficulty={selectedDifficulty}
                  onClose={handleClosePractice}
                  onComplete={handlePracticeComplete}
                />
              </div>
            )}

            {/* Difficulty Progression */}
            {showDifficultyProgression && (
              <div className="flex-1 overflow-y-auto p-4">
                <DifficultyProgression
                  topic={selectedMathTopic}
                  currentDifficulty={selectedDifficulty}
                  userProgress={userMathProgress[selectedMathTopic]}
                  onDifficultySelect={handleDifficultyChange}
                  onStartPractice={handleStartPractice}
                />
              </div>
            )}

            {/* Chat Messages */}
            {!showPracticeMode && !showDifficultyProgression && (
              <>
                <ChatWindow
                  messages={messages}
                  onCopyMessage={handleCopyMessage}
                  copiedMessageId={copiedMessageId}
                  onDeleteMessage={handleDeleteMessage}
                  onRegenerate={handleRegenerateMessage}
                  isTyping={isLoading}
                />
                
                                            <ComposerToolbar
                onUpload={handleImageUpload}
                onGenerateWorksheet={() => setIsWorksheetModalOpen(true)}
                onInsertText={(text) => composerRef.current?.insertText(text)}
                onOpenHelp={() => setIsCmdPaletteOpen(true)}
                disabled={!user || user.credits_balance < 2}
              />

              {/* Voice Input */}
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                onError={handleVoiceError}
                disabled={!user || user.credits_balance < 1}
              />
              
              <MessageInput
                  ref={composerRef}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  disabled={!user || user.credits_balance <= 0}
                  disabledReason={!user ? 'Musíte se přihlásit' : user.credits_balance <= 0 ? 'Nemáte dostatek kreditů' : undefined}
                />
              </>
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

        {/* Generated Worksheet Display */}
        {generatedWorksheet && (
          <WorksheetDisplay
            worksheet={generatedWorksheet}
            onClose={() => setGeneratedWorksheet(null)}
          />
        )}

              {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageUploadOpen}
        onClose={() => setIsImageUploadOpen(false)}
        onImageProcessed={handleImageProcessed}
      />

      {/* Chat Templates Modal */}
      <ChatTemplates
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onTemplateSelect={handleTemplateSelect}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        onAddCredits={handleAddCreditsShortcut}
        onNewChat={startNewChat}
        onGoMaterials={() => navigate('/materials')}
        onFocusComposer={() => composerRef.current?.focus()}
      />
    </div>
  );
  } catch (error) {
    console.error('ChatPage: Error rendering component:', error);
    return (
      <div className="min-h-screen bg-background dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Chyba při načítání chatu</h1>
          <p className="text-gray-600 mb-4">Došlo k chybě při vykreslování komponenty chatu.</p>
          <Button onClick={() => window.location.reload()}>
            Obnovit stránku
          </Button>
        </div>
      </div>
    );
  }
};

export default ChatPage; 