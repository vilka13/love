import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Coffee,
  Navigation,
  ExternalLink,
  ChevronDown,
  Edit3,
  Utensils,
  Star,
  Compass,
} from 'lucide-react';
import { SISI_VENUE } from './data/venue';
import { InvitationData, RsvpResponse, TravelMode } from './types/invitation';
import { InteractiveMap } from './components/InteractiveMap';
import { RoutePlanner } from './components/RoutePlanner';
import { ConfirmationBlock } from './components/ConfirmationBlock';
import { RsvpForm } from './components/RsvpForm';
import { InvitationCustomizerModal } from './components/InvitationCustomizerModal';

const MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCKARNfEEk30j7j7jverVHgG_Cys883Frk';

export default function App() {
  // Load personalized invitation details from URL parameters or defaults
  const [invitation, setInvitation] = useState<InvitationData>(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      recipientName: params.get('to') || 'Полина',
      inviterName: params.get('from') || 'Твой спутник',
      dateTime: '2026-10-17T10:00:00',
      displayDate: params.get('date') || 'Суббота, 17 октября',
      displayTime: params.get('time') || '10:00',
      title: params.get('title') || 'Приглашение на завтрак и кофе',
      invitationMessage:
        params.get('msg') ||
        'Я нашел кафе и приглашаю тебя туда на завтрак и выпить кофе :)',
      specialNote: 'Уютный столик в SiSi Food & Friends уже ждет нас!',
    };
  });

  // Stored RSVP Response
  const [rsvp, setRsvp] = useState<RsvpResponse | null>(() => {
    try {
      const saved = localStorage.getItem('sisi_date_rsvp');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Route Planning State
  const [selectedRouteOrigin, setSelectedRouteOrigin] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('WALKING');
  const [calculatedDistance, setCalculatedDistance] = useState<string>('');
  const [calculatedDuration, setCalculatedDuration] = useState<string>('');

  // Modals state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);

  // Save RSVP changes to state & localStorage
  const handleRsvpSubmit = (response: RsvpResponse) => {
    setRsvp(response);
    try {
      localStorage.setItem('sisi_date_rsvp', JSON.stringify(response));
    } catch {
      // storage quota or incognito
    }
  };

  const handleQuickConfirm = (decision: 'accepted' | 'reschedule') => {
    if (decision === 'accepted') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#fda4af', '#fbbf24', '#f43f5e', '#fff1f2'],
      });
    }
    const newRsvp: RsvpResponse = {
      decision,
      guestName: invitation.recipientName,
      preferredDrink: rsvp?.preferredDrink || '☕ Спешелти Капучино / Флэт Уайт',
      dietaryNote: '',
      messageToInviter: decision === 'reschedule' ? 'Давай согласуем другое удобное время!' : '',
      timestamp: new Date().toISOString(),
    };
    handleRsvpSubmit(newRsvp);
  };

  const handleResetRsvp = () => {
    setRsvp(null);
    try {
      localStorage.removeItem('sisi_date_rsvp');
    } catch {
      // Ignore
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 flex flex-col font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* Subtle background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-[140px]" />
      </div>

      {/* Top Floating Header */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/85 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span className="text-xs sm:text-sm text-stone-700 font-medium">
              Приглашение на свидание
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => scrollToSection('map-section')}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition hidden md:inline-flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Карта & Маршрут</span>
            </button>


            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              title="Настроить имена и дату"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition border border-stone-200"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16 sm:space-y-24">
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto pt-4 sm:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Romantic Sub-kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-medium text-rose-800 tracking-wider uppercase mb-4 bg-rose-50/80 px-3.5 py-1.5 rounded-full border border-rose-200/60 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Особенный повод для теплой встречи</span>
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            </div>

            <h1 className="font-romantic text-4xl sm:text-6xl text-stone-900 font-bold tracking-tight mb-4 leading-tight">
              {invitation.recipientName.toLowerCase().startsWith('дорогая')
                ? `${invitation.recipientName}, пойдем на свидание?`
                : `Дорогая ${invitation.recipientName}, пойдем на свидание?`}
            </h1>

            <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-light">
              {invitation.invitationMessage}
            </p>

            {/* Quick Details Ribbon */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-stone-700 bg-white/90 backdrop-blur-sm px-6 py-3.5 rounded-2xl border border-stone-200/80 shadow-xs mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-600" />
                <span className="font-medium text-stone-900">{invitation.displayDate}</span>
              </div>
              <span className="text-stone-300">·</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <span className="font-medium text-stone-900">{invitation.displayTime}</span>
              </div>
              <span className="text-stone-300">·</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span className="font-medium text-stone-900">{SISI_VENUE.shortAddress}</span>
              </div>
            </div>

            {/* Secondary Action */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => scrollToSection('map-section')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Navigation className="w-4 h-4 text-stone-500" />
                <span>Посмотреть локацию и путь</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* ANIMATED CONFIRMATION & GOOGLE CALENDAR SECTION */}
        {rsvp && (
          <section id="confirmation-section" className="scroll-mt-24">
            <ConfirmationBlock
              invitation={invitation}
              rsvp={rsvp}
              onConfirm={handleQuickConfirm}
              onReset={handleResetRsvp}
              onOpenRsvpForm={() => setIsRsvpModalOpen(true)}
            />
          </section>
        )}

        {/* VENUE SPOTLIGHT: SiSi Food & Friends */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm">
          <div className="max-w-3xl mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-2">
              <Coffee className="w-4 h-4 text-rose-600" />
              <span>О нашем месте встречи</span>
            </div>
            <h2 className="font-romantic text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
              {SISI_VENUE.name}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {SISI_VENUE.description}
            </p>
          </div>

          {/* Highlights grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SISI_VENUE.specialties.map((item) => (
              <div
                key={item.title}
                className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/60 hover:border-rose-200 transition"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 block mb-1">
                  {item.category}
                </span>
                <h4 className="font-semibold text-stone-900 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MAP & ROUTE PLANNER SECTION */}
        <section id="map-section" className="scroll-mt-24 space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-2">
              <Navigation className="w-3.5 h-3.5" />
              <span>Интерактивная карта & Маршрут</span>
            </div>
            <h2 className="font-romantic text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
              Где находится кафе и как добраться
            </h2>
            <p className="text-stone-600 text-sm">
              Точный адрес: <strong className="text-stone-900">{SISI_VENUE.address}</strong>.
              Постройте маршрут от вашего дома, вокзала или центра города.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Map on the left/top */}
            <div className="lg:col-span-7">
              <InteractiveMap
                apiKey={MAPS_API_KEY}
                routeOrigin={selectedRouteOrigin}
                travelMode={travelMode}
                onRouteCalculated={(dist, dur) => {
                  setCalculatedDistance(dist);
                  setCalculatedDuration(dur);
                }}
              />
            </div>

            {/* Route controls on the right */}
            <div className="lg:col-span-5">
              <RoutePlanner
                onSelectOrigin={(origin) => setSelectedRouteOrigin(origin)}
                onSelectTravelMode={(mode) => setTravelMode(mode)}
                currentTravelMode={travelMode}
                calculatedDistance={calculatedDistance}
                calculatedDuration={calculatedDuration}
              />
            </div>
          </div>
        </section>

        {/* DETAILED RSVP FORM SECTION */}
        <section className="bg-stone-100/70 rounded-3xl p-6 sm:p-10 border border-stone-200">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="font-romantic text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                Форма подтверждения участия
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm">
                Выберите любимый напиток или десерт в меню SiSi Food & Friends, чтобы я заранее всё подготовил
              </p>
            </div>

            <RsvpForm
              invitation={invitation}
              initialRsvp={rsvp}
              onSubmit={handleRsvpSubmit}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white/70 py-8 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span className="font-romantic text-base text-stone-800 font-semibold">
              SiSi Food & Friends · Познань
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={SISI_VENUE.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-900 flex items-center gap-1 transition"
            >
              <span>{SISI_VENUE.shortAddress}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <span>{SISI_VENUE.workingHours}</span>
          </div>
        </div>
      </footer>

      {/* Invitation Customizer Modal */}
      <InvitationCustomizerModal
        invitation={invitation}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onSave={(data) => setInvitation(data)}
      />

      {/* RSVP Modal (if opened via button) */}
      {isRsvpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <RsvpForm
            invitation={invitation}
            initialRsvp={rsvp}
            onSubmit={(data) => {
              handleRsvpSubmit(data);
              setIsRsvpModalOpen(false);
            }}
            onClose={() => setIsRsvpModalOpen(false)}
            isModal={true}
          />
        </div>
      )}
    </div>
  );
}
