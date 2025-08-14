import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';

interface NotificationItem {
  id: string;
  created_at: string;
  severity: 'info'|'warning'|'error';
  title: string;
  message: string;
  read_at: string | null;
}

const severityColor: Record<string, string> = {
  info: 'text-blue-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
};

const NotificationsDropdown: React.FC<{ onClose: () => void }>= ({ onClose }) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await apiClient.get('/notifications?limit=20');
      setItems(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setItems(prev => prev.map(i => i.id === id ? { ...i, read_at: new Date().toISOString() } : i));
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-50">
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 font-semibold">Notifikace</div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm text-neutral-600">Načítám…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-neutral-600">Žádné notifikace</div>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {items.map(item => (
              <li key={item.id} className={`p-3 ${!item.read_at ? 'bg-neutral-50 dark:bg-neutral-900' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`text-sm font-medium ${severityColor[item.severity]}`}>{item.title}</div>
                    <div className="text-sm text-neutral-700 dark:text-neutral-300">{item.message}</div>
                    <div className="text-xs text-neutral-500 mt-1">{new Date(item.created_at).toLocaleString('cs-CZ')}</div>
                  </div>
                  {!item.read_at && (
                    <button onClick={() => markRead(item.id)} className="text-xs text-blue-600 hover:underline">Označit jako přečtené</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 text-right">
        <button onClick={onClose} className="text-sm text-neutral-600 hover:underline">Zavřít</button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;


