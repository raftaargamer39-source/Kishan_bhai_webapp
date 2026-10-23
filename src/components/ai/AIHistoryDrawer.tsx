import React, { useState } from 'react';
import {
  History,
  Plus,
  Trash2,
  MessageSquare,
  Search,
  ChevronRight,
  Clock,
  X,
  Sparkles,
  Sprout,
} from 'lucide-react';
import { AIConversationSession } from '../../../shared/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessions: AIConversationSession[];
  activeSessionId?: string;
  onSelectSession: (session: AIConversationSession) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  language: string;
}

export const AIHistoryDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.crop && s.crop.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-700 text-white flex items-center justify-center font-bold">
              <History className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold font-display text-sm text-stone-900">
                {language === 'hi' ? 'सलाह का इतिहास' : 'Advisory History'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {sessions.length} {language === 'hi' ? 'बातचीत सहेजी गई' : 'conversations saved'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-stone-100">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-[#233f17] text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नई सलाह शुरू करें' : 'Start New Farming Chat'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-stone-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'इतिहास में खोजें...' : 'Search past conversations...'}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
              <p>{language === 'hi' ? 'कोई इतिहास नहीं मिला' : 'No past conversations found'}</p>
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const dateFormatted = new Date(s.updatedAt || s.lastUpdated || Date.now()).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSession(s);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between group ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sprout className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded truncate">
                        {s.crop || 'Farming'}
                      </span>
                      <span className="text-[10px] text-stone-400 ml-auto flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {dateFormatted}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-stone-900 truncate group-hover:text-emerald-900 transition-colors">
                      {s.title}
                    </h4>

                    <p className="text-[11px] text-stone-500 mt-1 truncate">
                      {s.messages.length} messages • {s.messages[s.messages.length - 1]?.content.slice(0, 45)}...
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer mt-1"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
