import React, { useState, useEffect } from 'react';
import { Conversation } from '../../types';
import { conversationService } from '../../services/conversationService';
import { useToast } from '../../contexts/ToastContext';
import { MessageSquare, Plus, Trash2, Edit3, Calendar } from 'lucide-react';
import Button from '../ui/Button';

interface ChatSidebarProps {
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  selectedConversationId?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onConversationSelect,
  onNewConversation,
  selectedConversationId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationService.getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      showToast({ type: 'error', message: 'Nepodařilo se načíst historii konverzací' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Opravdu chcete smazat tuto konverzaci?')) {
      return;
    }

    try {
      await conversationService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      showToast({ type: 'success', message: 'Konverzace byla smazána' });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      showToast({ type: 'error', message: 'Nepodařilo se smazat konverzaci' });
    }
  };

  const handleEditTitle = async (conversationId: string) => {
    try {
      await conversationService.updateConversationTitle(conversationId, editTitle);
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId 
            ? { ...c, title: editTitle }
            : c
        )
      );
      setEditingId(null);
      setEditTitle('');
      showToast({ type: 'success', message: 'Název konverzace byl aktualizován' });
    } catch (error) {
      console.error('Failed to update conversation title:', error);
      showToast({ type: 'error', message: 'Nepodařilo se aktualizovat název konverzace' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('cs-CZ', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('cs-CZ', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('cs-CZ', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const truncateTitle = (title: string, maxLength = 30) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Historie konverzací</h2>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-neutral-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-neutral-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Historie konverzací</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={onNewConversation}
            className="flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Nová</span>
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-neutral-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
            <p>Žádné konverzace</p>
            <p className="text-sm">Začněte novou konverzaci</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors transition-transform ${
                  selectedConversationId === conversation.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-neutral-50 hover:-translate-y-0.5'
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                {/* Edit mode */}
                {editingId === conversation.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                    <div className="flex space-x-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditTitle(conversation.id)}
                        className="text-xs"
                      >
                        Uložit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditTitle('');
                        }}
                        className="text-xs"
                      >
                        Zrušit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Conversation content */}
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-neutral-900 truncate">
                          {truncateTitle(conversation.title)}
                        </h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Calendar className="h-3 w-3 text-neutral-400" />
                          <span className="text-xs text-neutral-500">
                            {formatDate(conversation.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(conversation.id);
                            setEditTitle(conversation.title);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation.id);
                          }}
                          className="h-6 w-6 p-0 text-danger-600 hover:text-danger-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar; 