import React from 'react';
import { SISI_VENUE } from '../data/venue';
import { TravelMode } from '../types/invitation';
import {
  Footprints,
  Car,
  Bike,
  Bus,
  ExternalLink,
  Compass,
  Info,
  MapPin,
} from 'lucide-react';

interface RoutePlannerProps {
  onSelectOrigin: (origin: { lat: number; lng: number; name: string } | null) => void;
  onSelectTravelMode: (mode: TravelMode) => void;
  currentTravelMode: TravelMode;
  calculatedDistance?: string;
  calculatedDuration?: string;
}

export function RoutePlanner({
  onSelectOrigin,
  onSelectTravelMode,
  currentTravelMode,
}: RoutePlannerProps) {
  // Clear any preset origins on mount
  React.useEffect(() => {
    onSelectOrigin(null);
  }, []);

  const travelModes: {
    id: TravelMode;
    label: string;
    icon: React.ReactNode;
    googleMode: string;
    description: string;
  }[] = [
    {
      id: 'WALKING',
      label: 'Пешком',
      icon: <Footprints className="w-4 h-4" />,
      googleMode: 'walking',
      description: 'Приятная прогулка по улочкам района Jeżyce',
    },
    {
      id: 'TRANSIT',
      label: 'Транспорт',
      icon: <Bus className="w-4 h-4" />,
      googleMode: 'transit',
      description: 'Трамваи 2, 17, 18 до остановки Rynek Jeżycki',
    },
    {
      id: 'DRIVING',
      label: 'На авто',
      icon: <Car className="w-4 h-4" />,
      googleMode: 'driving',
      description: 'Быстрый проезд с парковкой на ул. Szamarzewskiego',
    },
    {
      id: 'BICYCLING',
      label: 'Велосипед',
      icon: <Bike className="w-4 h-4" />,
      googleMode: 'bicycling',
      description: 'Велодорожки вдоль Kraszewskiego и Dąbrowskiego',
    },
  ];

  const currentModeConfig =
    travelModes.find((m) => m.id === currentTravelMode) || travelModes[0];

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${SISI_VENUE.coordinates.lat},${SISI_VENUE.coordinates.lng}`
  )}&travelmode=${currentModeConfig.googleMode}`;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/90 text-stone-800">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-base">Как добраться до кафе</h3>
            <p className="text-xs text-stone-500">
              Быстрый маршрут от вашей точки в Google Карты
            </p>
          </div>
        </div>
      </div>

      {/* Travel Mode Selector */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
          Способ передвижения:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {travelModes.map((mode) => {
            const isActive = currentTravelMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectTravelMode(mode.id)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'border-rose-500 bg-rose-600 text-white shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-stone-500 mt-2 italic">
          {currentModeConfig.description}
        </p>
      </div>

      {/* Destination & Navigation Action Card */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/70 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="font-semibold text-stone-900">{SISI_VENUE.name}</span>
            </div>
            <p className="text-xs text-stone-600">
              {SISI_VENUE.address}
            </p>
          </div>

          {/* Launch Navigator Button */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition shrink-0"
          >
            <span>Поехать по навигатору</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Local Transit tip */}
        <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-start gap-2 text-xs text-stone-600">
          <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p>
            Кафе расположено на углу улиц <strong>Szamarzewskiego и Kraszewskiego</strong> (район Jeżyce). Ближайшая остановка трамваев — <em>Rynek Jeżycki</em> (линии 2, 17, 18), всего 2 минуты пешком.
          </p>
        </div>
      </div>
    </div>
  );
}
