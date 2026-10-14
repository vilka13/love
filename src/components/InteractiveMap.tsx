import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { SISI_VENUE } from '../data/venue';
import { Heart, Navigation, MapPin, ExternalLink, Coffee, Star, Clock } from 'lucide-react';
import { TravelMode } from '../types/invitation';

interface InteractiveMapProps {
  apiKey: string;
  routeOrigin?: { lat: number; lng: number; name: string } | null;
  travelMode?: TravelMode;
  onRouteCalculated?: (distanceText: string, durationText: string) => void;
}

// Inner component to handle routes and camera fitting
function MapRouteRenderer({
  routeOrigin,
  travelMode,
  onRouteCalculated,
}: {
  routeOrigin?: { lat: number; lng: number; name: string } | null;
  travelMode: TravelMode;
  onRouteCalculated?: (distanceText: string, durationText: string) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clean up previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!routeOrigin) {
      map.panTo(SISI_VENUE.coordinates);
      map.setZoom(16);
      return;
    }

    if (!routesLib) {
      // Fallback simple line or bounds fit
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(routeOrigin);
      bounds.extend(SISI_VENUE.coordinates);
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      return;
    }

    // Try modern Route.computeRoutes or DirectionsService
    const originLatLng = { lat: routeOrigin.lat, lng: routeOrigin.lng };
    const destinationLatLng = SISI_VENUE.coordinates;

    const request = {
      origin: originLatLng,
      destination: destinationLatLng,
      travelMode: travelMode as any,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    };

    if ((routesLib as any).Route && typeof (routesLib as any).Route.computeRoutes === 'function') {
      (routesLib as any).Route.computeRoutes(request)
        .then(({ routes }: { routes: any[] }) => {
          if (routes && routes.length > 0) {
            const primaryRoute = routes[0];
            const newPolylines = primaryRoute.createPolylines();
            newPolylines.forEach((poly: google.maps.Polyline) => {
              poly.setOptions({
                strokeColor: '#e11d48', // rose-600
                strokeWeight: 5,
                strokeOpacity: 0.85,
              });
              poly.setMap(map);
            });
            polylinesRef.current = newPolylines;

            if (primaryRoute.viewport) {
              map.fitBounds(primaryRoute.viewport);
            }

            if (onRouteCalculated && primaryRoute.distanceMeters && primaryRoute.durationMillis) {
              const km = (primaryRoute.distanceMeters / 1000).toFixed(1) + ' км';
              const mins = Math.round(primaryRoute.durationMillis / 60000) + ' мин';
              onRouteCalculated(km, mins);
            }
          }
        })
        .catch(() => {
          // If routes API throws, fit both points
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(originLatLng);
          bounds.extend(destinationLatLng);
          map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
        });
    } else {
      // Fit bounds
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(originLatLng);
      bounds.extend(destinationLatLng);
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    }

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routesLib, routeOrigin, travelMode]);

  return null;
}

export function InteractiveMap({
  apiKey,
  routeOrigin,
  travelMode = 'WALKING',
  onRouteCalculated,
}: InteractiveMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<boolean>(true);
  const [mapError, setMapError] = useState<boolean>(false);

  return (
    <div className="relative w-full h-[480px] md:h-[540px] rounded-2xl overflow-hidden shadow-lg border border-rose-100 bg-stone-100">
      {apiKey && !mapError ? (
        <APIProvider
          apiKey={apiKey}
          onError={() => setMapError(true)}
        >
          <Map
            defaultCenter={SISI_VENUE.coordinates}
            defaultZoom={16}
            mapId="DEMO_MAP_ID"
            gestureHandling="cooperative"
            disableDefaultUI={false}
            zoomControl={true}
            streetViewControl={false}
            mapTypeControl={false}
            fullscreenControl={true}
            className="w-full h-full"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {/* SiSi Food & Friends Destination Marker */}
            <AdvancedMarker
              position={SISI_VENUE.coordinates}
              onClick={() => setSelectedMarker(true)}
              title={SISI_VENUE.name}
            >
              <div className="relative group cursor-pointer">
                <span className="absolute -inset-1 rounded-full bg-rose-500/30 animate-ping" />
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-rose-600 text-white shadow-xl border-2 border-white transform transition hover:scale-110">
                  <Heart className="w-6 h-6 fill-rose-100 text-rose-100" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap bg-stone-900/90 text-white text-xs px-2.5 py-1 rounded-md shadow-md backdrop-blur-xs font-medium">
                  {SISI_VENUE.name} ☕
                </div>
              </div>
            </AdvancedMarker>

            {/* Optional Starting Point Marker */}
            {routeOrigin && (
              <AdvancedMarker position={routeOrigin} title={routeOrigin.name}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-900 text-white shadow-lg border-2 border-white">
                  <Navigation className="w-5 h-5 text-amber-300" />
                </div>
              </AdvancedMarker>
            )}

            {/* Interactive Info Window */}
            {selectedMarker && (
              <InfoWindow
                position={SISI_VENUE.coordinates}
                onCloseClick={() => setSelectedMarker(false)}
                headerContent={
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5 pr-2">
                    <Coffee className="w-4 h-4 text-rose-600" />
                    <span>{SISI_VENUE.name}</span>
                  </div>
                }
              >
                <div className="p-1 max-w-[260px] text-stone-700">
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{SISI_VENUE.rating} из 5 · {SISI_VENUE.reviewsCount} отзывов</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2">
                    {SISI_VENUE.address}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 mb-3">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{SISI_VENUE.workingHours}</span>
                  </div>
                  <a
                    href={SISI_VENUE.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-xs"
                  >
                    <span>Открыть в Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </InfoWindow>
            )}

            <MapRouteRenderer
              routeOrigin={routeOrigin}
              travelMode={travelMode}
              onRouteCalculated={onRouteCalculated}
            />
          </Map>
        </APIProvider>
      ) : (
        /* Fallback Interactive Embed Map */
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <iframe
            title="SiSi Food & Friends Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2433.916867083091!2d16.900277715801756!3d52.41034777979313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47044500022be973%3A0x8bb53037a2e16fc1!2sSiSi%20Food%20%26%20Friends!5e0!3m2!1sru!2spl!4v1710000000000!5m2!1sru!2spl`}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Floating Venue Tag badge */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-stone-200/80 flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <div className="text-left">
          <p className="text-xs font-semibold text-stone-900 leading-tight">SiSi Food & Friends</p>
          <p className="text-[11px] text-stone-500">Познань · район Ежице</p>
        </div>
      </div>

      {/* Quick Action Overlay */}
      <div className="absolute bottom-4 right-4 z-10">
        <a
          href={SISI_VENUE.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900/90 text-white text-xs font-medium backdrop-blur-md hover:bg-stone-900 shadow-md transition"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>Смотреть точку в Google Maps</span>
          <ExternalLink className="w-3 h-3 text-stone-400" />
        </a>
      </div>
    </div>
  );
}
