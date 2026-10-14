import React, { useState } from 'react';
import { RsvpResponse, RsvpDecision, InvitationData } from '../types/invitation';
import {
  Heart,
  Check,
  Send,
  X,
  Mail,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RsvpFormProps {
  invitation: InvitationData;
  initialRsvp: RsvpResponse | null;
  onSubmit: (data: RsvpResponse) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const TARGET_EMAIL = 'lukumer1997@gmail.com';

const DRINK_OPTIONS = [
  { id: 'cappuccino', label: '☕ Спешелти Капучино / Флэт Уайт', desc: 'Мягкий кофе свежей обжарки' },
  { id: 'matcha', label: '🍵 Церемониальный Матча Латте', desc: 'На овсяном или обычном молоке' },
  { id: 'racuchy', label: '🥞 Ракухи Сиси с ягодами', desc: 'Хит кафе с нежным маскарпоне' },
  { id: 'croissant', label: '🥐 Свежий французский круассан', desc: 'С фисташковым или миндальным кремом' },
  { id: 'sparkling_tea', label: '🍹 Игристый чай (Sparkling Tea)', desc: 'Освежающий безалкогольный напиток' },
  { id: 'surprise', label: '✨ Сюрприз на твой выбор!', desc: 'Доверяю твоему вкусу' },
];

export function RsvpForm({
  invitation,
  initialRsvp,
  onSubmit,
  onClose,
  isModal = false,
}: RsvpFormProps) {
  const [decision, setDecision] = useState<RsvpDecision>(
    initialRsvp?.decision || 'accepted'
  );
  const [guestName, setGuestName] = useState<string>(
    initialRsvp?.guestName || invitation.recipientName
  );
  const [preferredDrink, setPreferredDrink] = useState<string>(
    initialRsvp?.preferredDrink || DRINK_OPTIONS[0].label
  );
  const [customTimeNote, setCustomTimeNote] = useState<string>(
    initialRsvp?.customTimeNote || ''
  );
  const [messageToInviter, setMessageToInviter] = useState<string>(
    initialRsvp?.messageToInviter || ''
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'fallback'>('idle');

  // Build Gmail & Mailto URLs
  const getEmailContent = (resp: RsvpResponse) => {
    const decisionText =
      resp.decision === 'accepted'
        ? 'Да, я с радостью согласна на свидание! ❤️'
        : resp.decision === 'reschedule'
        ? `Да, но давай согласуем другое время: ${resp.customTimeNote || 'время уточняется'} ☕`
        : 'К сожалению, в этот раз не получится 🥺';

    const subject = `🎉 ${resp.guestName} ответила на приглашение на свидание!`;

    const body = `Привет!

${resp.guestName} отправила ответ на твое приглашение на свидание!

📋 Детали встречи:
• Ответ: ${decisionText}
• Имя: ${resp.guestName}
• Дата и время: ${invitation.displayDate} в ${invitation.displayTime}
• Место: SiSi Food & Friends (ul. Szamarzewskiego 1/1, Poznań)
${resp.preferredDrink ? `• Выбранный напиток/десерт: ${resp.preferredDrink}` : ''}
${resp.messageToInviter ? `• Сообщение от нее: "${resp.messageToInviter}"` : ''}

Отправлено со страницы приглашения на свидание ✨`;

    return { subject, body };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const response: RsvpResponse = {
      decision,
      guestName: guestName.trim() || invitation.recipientName,
      preferredDrink,
      dietaryNote: '',
      customTimeNote: decision === 'reschedule' ? customTimeNote : undefined,
      messageToInviter: messageToInviter.trim(),
      timestamp: new Date().toISOString(),
    };

    const { subject, body } = getEmailContent(response);

    // Send email to TARGET_EMAIL via formsubmit
    try {
      const emailPayload = {
        name: response.guestName,
        decision:
          response.decision === 'accepted'
            ? 'Да, согласна! ❤️'
            : response.decision === 'reschedule'
            ? `В другое время: ${response.customTimeNote || ''}`
            : 'Не сможет 🥺',
        meeting_date: `${invitation.displayDate} в ${invitation.displayTime}`,
        location: 'SiSi Food & Friends (ul. Szamarzewskiego 1/1, Poznań)',
        preferred_item: response.preferredDrink,
        guest_message: response.messageToInviter || 'Без комментария',
        _subject: subject,
        _template: 'box',
      };

      await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      setEmailStatus('success');
    } catch {
      setEmailStatus('fallback');
    } finally {
      setIsSending(false);
    }

    if (decision === 'accepted') {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#fb7185', '#f59e0b'],
      });
    }

    onSubmit(response);

    if (isModal && onClose) {
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const currentEmailContent = getEmailContent({
    decision,
    guestName: guestName.trim() || invitation.recipientName,
    preferredDrink,
    dietaryNote: '',
    customTimeNote,
    messageToInviter,
    timestamp: new Date().toISOString(),
  });

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${TARGET_EMAIL}&su=${encodeURIComponent(
    currentEmailContent.subject
  )}&body=${encodeURIComponent(currentEmailContent.body)}`;

  const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(
    currentEmailContent.subject
  )}&body=${encodeURIComponent(currentEmailContent.body)}`;

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-lg ${isModal ? 'max-w-lg w-full' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-base">Подтверждение участия</h3>
            <p className="text-xs text-stone-500">
              Ответ будет отправлен на <strong className="text-stone-700">{TARGET_EMAIL}</strong>
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Decision choices */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Твое решение:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDecision('accepted')}
              className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                decision === 'accepted'
                  ? 'border-rose-500 bg-rose-50/70 text-rose-900 ring-2 ring-rose-500/20'
                  : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
              }`}
            >
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <span>Да, буду! ❤️</span>
              </span>
              <span className="text-[11px] text-stone-500 leading-tight">
                {invitation.displayDate}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDecision('reschedule')}
              className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                decision === 'reschedule'
                  ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20'
                  : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
              }`}
            >
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <span>В другое время ☕</span>
              </span>
              <span className="text-[11px] text-stone-500 leading-tight">
                Давай скорректируем
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDecision('declined')}
              className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                decision === 'declined'
                  ? 'border-stone-500 bg-stone-100 text-stone-900'
                  : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
              }`}
            >
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <span>Не получится 🥺</span>
              </span>
              <span className="text-[11px] text-stone-500 leading-tight">
                К сожалению, занята
              </span>
            </button>
          </div>
        </div>

        {/* Reschedule note if selected */}
        {decision === 'reschedule' && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2">
            <label className="block text-xs font-semibold text-amber-900">
              Какое время или день тебе удобнее?
            </label>
            <input
              type="text"
              value={customTimeNote}
              onChange={(e) => setCustomTimeNote(e.target.value)}
              placeholder="Например: лучше в субботу днем в 14:00"
              className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Drink / Treat Preference */}
        {decision !== 'declined' && (
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Что для тебя заказать в SiSi Food & Friends?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DRINK_OPTIONS.map((opt) => {
                const isSelected = preferredDrink === opt.label;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPreferredDrink(opt.label)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/60 text-stone-900 ring-1 ring-rose-500'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-rose-600 bg-rose-600 text-white'
                            : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-tight">{opt.label}</p>
                      <p className="text-[11px] text-stone-400 truncate">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Personal Note */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Теплое сообщение или пожелание (необязательно):
          </label>
          <textarea
            rows={2}
            value={messageToInviter}
            onChange={(e) => setMessageToInviter(e.target.value)}
            placeholder="Например: С нетерпением жду встречи! Очень хочу попробовать их панкейки :)"
            className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Email Destination Note */}
        <div className="flex items-center gap-2 text-xs text-stone-500 bg-rose-50/50 px-3.5 py-2.5 rounded-xl border border-rose-100">
          <Mail className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            Ответ будет отправлен на почту: <strong className="text-stone-800">{TARGET_EMAIL}</strong>
          </span>
        </div>

        {/* Status notification if sent */}
        {emailStatus === 'success' && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Информация успешно отправлена на {TARGET_EMAIL}!</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 space-y-2">
          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
            <span>
              {isSending
                ? 'Отправка на почту...'
                : decision === 'accepted'
                ? 'Отправить ответ и подтвердить встречу ❤️'
                : decision === 'reschedule'
                ? 'Отправить предложение по времени'
                : 'Отправить ответ'}
            </span>
          </button>

          {/* Quick Gmail Direct Option */}
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-stone-500">
            <span>Или открыть в почтовом клиенте:</span>
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1 underline underline-offset-2"
            >
              <span>Gmail</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span>·</span>
            <a
              href={mailtoUrl}
              className="text-stone-600 hover:text-stone-800 font-medium inline-flex items-center gap-1 underline underline-offset-2"
            >
              <span>Почта</span>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
