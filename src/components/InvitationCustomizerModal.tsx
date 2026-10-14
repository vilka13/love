import React, { useState } from 'react';
import { InvitationData } from '../types/invitation';
import { X, Sparkles, Check, Share2, Calendar, Clock, User, MessageSquare } from 'lucide-react';

interface InvitationCustomizerModalProps {
  invitation: InvitationData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InvitationData) => void;
}

export function InvitationCustomizerModal({
  invitation,
  isOpen,
  onClose,
  onSave,
}: InvitationCustomizerModalProps) {
  const [formData, setFormData] = useState<InvitationData>(invitation);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof InvitationData, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleCopyLink = () => {
    const params = new URLSearchParams({
      to: formData.recipientName,
      from: formData.inviterName,
      date: formData.displayDate,
      time: formData.displayTime,
      title: formData.title,
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-stone-900 text-lg">
              Настроить приглашение
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Имя получателя (кого зовем):
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => handleChange('recipientName', e.target.value)}
                  placeholder="Например: Полина"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Твое имя (кто приглашает):
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.inviterName}
                  onChange={(e) => handleChange('inviterName', e.target.value)}
                  placeholder="Например: Александр"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Дата свидания:
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.displayDate}
                  onChange={(e) => handleChange('displayDate', e.target.value)}
                  placeholder="Суббота, 17 октября"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Время встречи:
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.displayTime}
                  onChange={(e) => handleChange('displayTime', e.target.value)}
                  placeholder="10:00"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Заголовок приглашения:
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Романтическое послание:
            </label>
            <textarea
              rows={3}
              value={formData.invitationMessage}
              onChange={(e) => handleChange('invitationMessage', e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-3 flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition"
            >
              Сохранить изменения
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{copied ? 'Ссылка скопирована!' : 'Скопировать ссылку'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
