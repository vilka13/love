export interface InvitationData {
  inviterName: string;
  recipientName: string;
  dateTime: string; // ISO string or human string
  displayDate: string;
  displayTime: string;
  title: string;
  invitationMessage: string;
  specialNote: string;
}

export type RsvpDecision = 'pending' | 'accepted' | 'declined' | 'reschedule';

export interface RsvpResponse {
  decision: RsvpDecision;
  guestName: string;
  preferredDrink: string;
  dietaryNote: string;
  customTimeNote?: string;
  messageToInviter: string;
  timestamp: string;
}

export type TravelMode = 'WALKING' | 'DRIVING' | 'BICYCLING' | 'TRANSIT';

export interface RouteOption {
  label: string;
  addressOrCoords: string;
  iconName: string;
  coordinates: { lat: number; lng: number };
}

export interface CalculatedRoute {
  distanceText: string;
  durationText: string;
  travelMode: TravelMode;
  originName: string;
  summarySteps?: string[];
}
