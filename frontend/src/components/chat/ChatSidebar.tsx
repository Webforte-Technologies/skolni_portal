import React, { useState, useEffect } from 'react';
import { Conversation } from '../../types';
import { conversationService } from '../../services/conversationService';
import { useToast } from '../../contexts/ToastContext';
import { MessageSquare, Plus, Trash2, Edit3, Calendar, Search, Star } from 'lucide-react';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'starred' | 'math' | 'worksheets'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [starred, setStarred] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('starredConversations') || '{}'); } catch { return {}; }
  });

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

  const toggleStar = (id: string) => {
    setStarred(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('starredConversations', JSON.stringify(next));
      return next;
    });
  };

  const confirmDeleteConversation = (conversationId: string) => {
    setPendingDeleteId(conversationId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await conversationService.deleteConversation(pendingDeleteId);
      setConversations(prev => prev.filter(c => c.id !== pendingDeleteId));
      showToast({ type: 'success', message: 'Konverzace byla smazána' });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      showToast({ type: 'error', message: 'Nepodařilo se smazat konverzaci' });
    } finally {
      setIsDeleteModalOpen(false);
      setPendingDeleteId(null);
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

  const getFilteredConversations = () => {
    let filtered = conversations;

    // Text search - only search in titles since messages aren't loaded in the sidebar
    if (query) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Type filter
    switch (filterType) {
      case 'recent':
        filtered = filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'starred':
        filtered = filtered.filter(c => starred[c.id]);
        break;
      case 'math':
        filtered = filtered.filter(c => 
          c.title.toLowerCase().includes('matematika') ||
          c.title.toLowerCase().includes('math') ||
          c.title.toLowerCase().includes('rovnice') ||
          c.title.toLowerCase().includes('vzorec')
        );
        break;
      case 'worksheets':
        filtered = filtered.filter(c => 
          c.title.toLowerCase().includes('cvičení') ||
          c.title.toLowerCase().includes('worksheet') ||
          c.title.toLowerCase().includes('úkol')
        );
        break;
    }

    // Date filter
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(c => {
          const convDate = new Date(c.updated_at);
          return convDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        filtered = filtered.filter(c => {
          const convDate = new Date(c.updated_at);
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return convDate >= weekAgo;
        });
        break;
      case 'month':
        filtered = filtered.filter(c => {
          const convDate = new Date(c.updated_at);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return convDate >= monthAgo;
        });
        break;
    }

    // Sort by starred first, then by date
    return filtered.sort((a, b) => {
      const starredDiff = Number(Boolean(starred[b.id])) - Number(Boolean(starred[a.id]));
      if (starredDiff !== 0) return starredDiff;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  };

  if (loading) {
    return (
      <div className="w-80 bg-card dark:bg-neutral-950 border-r border-border dark:border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground dark:text-neutral-100">Historie konverzací</h2>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-muted dark:bg-neutral-800 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card dark:bg-neutral-950 border-r border-border dark:border-neutral-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border dark:border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground dark:text-neutral-100">Historie konverzací</h2>
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
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border dark:border-neutral-800 bg-background dark:bg-neutral-900 text-sm text-foreground dark:text-neutral-100 placeholder-muted-foreground"
            placeholder="Hledat v názvech a zprávách..."
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 mb-3">
          {[
            { key: 'all', label: 'Vše', icon: '📋' },
            { key: 'recent', label: 'Poslední', icon: '🕒' },
            { key: 'starred', label: 'Oblíbené', icon: '⭐' },
            { key: 'math', label: 'Matematika', icon: '📐' },
            { key: 'worksheets', label: 'Cvičení', icon: '📝' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilterType(key as any)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                filterType === key
                  ? 'bg-primary-500 text-white'
                  : 'bg-muted dark:bg-neutral-800 text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'Všechny' },
            { key: 'today', label: 'Dnes' },
            { key: 'week', label: 'Týden' },
            { key: 'month', label: 'Měsíc' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDateFilter(key as any)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                dateFilter === key
                  ? 'bg-secondary-500 text-white'
                  : 'bg-muted dark:bg-neutral-800 text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div className="text-xs text-muted-foreground text-center mt-2">
          {getFilteredConversations().length} z {conversations.length} konverzací
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground dark:text-neutral-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-muted-foreground dark:text-neutral-500" />
            <p>Žádné konverzace</p>
            <p className="text-sm">Začněte novou konverzaci</p>
          </div>
        ) : (
          <div className="p-2">
            {getFilteredConversations().map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors transition-transform ${
                  selectedConversationId === conversation.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-muted dark:hover:bg-neutral-800 hover:-translate-y-0.5'
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
                      className="w-full px-2 py-1 text-sm border border-border dark:border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background dark:bg-neutral-900 text-foreground dark:text-neutral-100"
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
                      <MessageSquare className="h-4 w-4 text-muted-foreground dark:text-neutral-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground dark:text-neutral-100 truncate">
                          {truncateTitle(conversation.title)}
                        </h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground dark:text-neutral-400" />
                          <span className="text-xs text-muted-foreground dark:text-neutral-500">
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
                            toggleStar(conversation.id);
                          }}
                          className={`h-6 w-6 p-0 ${starred[conversation.id] ? 'text-yellow-500' : ''}`}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
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
                            confirmDeleteConversation(conversation.id);
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
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Smazat konverzaci"
        message="Opravdu chcete smazat tuto konverzaci? Tuto akci nelze vrátit zpět."
        confirmText="Smazat"
        cancelText="Zrušit"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
};

export default ChatSidebar; 