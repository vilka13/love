import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  Coffee,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { InvitationData, RsvpResponse } from '../types/invitation';
import { SISI_VENUE } from '../data/venue';
import {
  createGoogleCalendarUrl,
  downloadIcsFile,
  getEventDateTimes,
} from '../utils/calendar';

interface ConfirmationBlockProps {
  invitation: InvitationData;
  rsvp: RsvpResponse | null;
  onConfirm: (decision: 'accepted' | 'reschedule') => void;
  onReset: () => void;
  onOpenRsvpForm: () => void;
}

export function ConfirmationBlock({
  invitation,
  rsvp,
  onConfirm,
  onReset,
  onOpenRsvpForm,
}: ConfirmationBlockProps) {
  const isAccepted = rsvp?.decision === 'accepted';
  const isReschedule = rsvp?.decision === 'reschedule';
  const hasAnswered = isAccepted || isReschedule;

  // Countdown state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const { startDate } = getEventDateTimes(invitation);

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = startDate.getTime() - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [invitation]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Свидание в SiSi Food & Friends`,
        text: `Наше свидание подтверждено! Встречаемся в SiSi Food & Friends (${invitation.displayDate} в ${invitation.displayTime}) ❤️`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const googleCalendarUrl = createGoogleCalendarUrl(invitation);

  if (!hasAnswered) {
    return null;
  }

  return (
    <div id="rsvp-section" className="relative w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
          /* Confirmed Animated Card State */
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-rose-200 relative overflow-hidden text-stone-800"
          >
            {/* Top Celebration Banner */}
            <div className="flex items-center justify-between pb-6 border-b border-stone-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Свидание подтверждено!</span>
                  </div>
                  <h3 className="font-romantic text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                    Мы идем в SiSi Food & Friends
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onReset}
                title="Изменить ответ"
                className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Live Countdown Timer */}
            {!timeLeft.isPast && (
              <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-md">
                <p className="text-xs uppercase tracking-wider text-rose-300 font-semibold mb-3 text-center sm:text-left">
                  ⏳ До нашего особенного вечера осталось:
                </p>
                <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                  <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                    <span className="block font-bold text-xl sm:text-2xl text-white font-mono">
                      {timeLeft.days}
                    </span>
                    <span className="text-[10px] sm:text-xs text-stone-300">дней</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                    <span className="block font-bold text-xl sm:text-2xl text-white font-mono">
                      {timeLeft.hours}
                    </span>
                    <span className="text-[10px] sm:text-xs text-stone-300">часов</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                    <span className="block font-bold text-xl sm:text-2xl text-white font-mono">
                      {timeLeft.minutes}
                    </span>
                    <span className="text-[10px] sm:text-xs text-stone-300">минут</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                    <span className="block font-bold text-xl sm:text-2xl text-white font-mono text-rose-400">
                      {timeLeft.seconds}
                    </span>
                    <span className="text-[10px] sm:text-xs text-stone-300">секунд</span>
                  </div>
                </div>
              </div>
            )}

            {/* Personalized Date Ticket */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 sm:p-6 mb-6 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-800">
                  Билет на свидание #001
                </span>
                <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-xs text-stone-500 block mb-0.5">Для кого:</span>
                  <p className="font-semibold text-stone-900">{invitation.recipientName}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block mb-0.5">От кого:</span>
                  <p className="font-semibold text-stone-900">{invitation.inviterName}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block mb-0.5">Дата и время:</span>
                  <div className="flex items-center gap-1.5 font-medium text-stone-900">
                    <Calendar className="w-3.5 h-3.5 text-rose-600" />
                    <span>{invitation.displayDate} в {invitation.displayTime}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block mb-0.5">Локация:</span>
                  <div className="flex items-center gap-1.5 font-medium text-stone-900">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span className="truncate">{SISI_VENUE.shortAddress}</span>
                  </div>
                </div>
              </div>

              {rsvp?.preferredDrink && (
                <div className="pt-3 border-t border-rose-200/60 flex items-center gap-2 text-xs text-rose-950 font-medium">
                  <Coffee className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Выбранный напиток / десерт: <strong>{rsvp.preferredDrink}</strong></span>
                </div>
              )}

              {rsvp?.messageToInviter && (
                <div className="mt-2 text-xs italic text-stone-600 bg-white/70 p-2.5 rounded-lg border border-rose-100">
                  «{rsvp.messageToInviter}»
                </div>
              )}
            </div>

            {/* Google Calendar & Export Actions */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Сохранить в свой календарь:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1-Click Google Calendar */}
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Добавить в Google Календарь</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                </a>

                {/* Download .ICS */}
                <button
                  type="button"
                  onClick={() => downloadIcsFile(invitation)}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs sm:text-sm shadow-2xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-stone-600" />
                  <span>Скачать .ics (Apple / Outlook)</span>
                </button>
              </div>

              {/* Share link and update RSVP */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 transition"
                >
                  <Share2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>{copiedLink ? 'Ссылка скопирована в буфер!' : 'Поделиться страницей встречи'}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenRsvpForm}
                  className="text-xs text-rose-700 hover:text-rose-800 font-medium underline underline-offset-4"
                >
                  Изменить пожелания или напиток
                </button>
              </div>
            </div>
          </motion.div>
      </AnimatePresence>
    </div>
  );
}
