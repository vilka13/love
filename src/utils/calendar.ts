import { InvitationData } from '../types/invitation';
import { SISI_VENUE } from '../data/venue';

/**
 * Format a Date object to UTC string suitable for Google Calendar & iCal (YYYYMMDDTHHmmssZ)
 */
export function formatCalendarDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Parse an invitation date string or default to an upcoming Friday evening
 */
export function getEventDateTimes(invitation: InvitationData): { startDate: Date; endDate: Date } {
  let startDate: Date;

  try {
    if (invitation.dateTime && !isNaN(Date.parse(invitation.dateTime))) {
      startDate = new Date(invitation.dateTime);
    } else {
      // Default to next Friday at 18:30
      startDate = new Date();
      const currentDay = startDate.getDay();
      const daysUntilFriday = (5 - currentDay + 7) % 7 || 7;
      startDate.setDate(startDate.getDate() + daysUntilFriday);
      startDate.setHours(18, 30, 0, 0);
    }
  } catch {
    startDate = new Date(Date.now() + 86400000 * 3);
    startDate.setHours(18, 30, 0, 0);
  }

  // End date is 2 hours later
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  return { startDate, endDate };
}

/**
 * Generates direct Google Calendar add event URL
 */
export function createGoogleCalendarUrl(invitation: InvitationData): string {
  const { startDate, endDate } = getEventDateTimes(invitation);
  const startStr = formatCalendarDate(startDate);
  const endStr = formatCalendarDate(endDate);

  const title = `Свидание в SiSi Food & Friends ☕❤️ (${invitation.recipientName} & ${invitation.inviterName})`;
  const details = `${invitation.title}\n\n${invitation.invitationMessage}\n\n📍 Место: ${SISI_VENUE.name}\nАдрес: ${SISI_VENUE.address}\nКарта: ${SISI_VENUE.googleMapsUrl}\n\nДо встречи!`;
  const location = `${SISI_VENUE.name}, ${SISI_VENUE.address}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and triggers download of .ics calendar file
 */
export function downloadIcsFile(invitation: InvitationData): void {
  const { startDate, endDate } = getEventDateTimes(invitation);
  const startStr = formatCalendarDate(startDate);
  const endStr = formatCalendarDate(endDate);
  const nowStr = formatCalendarDate(new Date());

  const title = `Свидание в SiSi Food & Friends ☕❤️`;
  const description = `${invitation.invitationMessage.replace(/\n/g, '\\n')}\\n\\nМесто: ${SISI_VENUE.name}\\nАдрес: ${SISI_VENUE.address}\\nСсылка: ${SISI_VENUE.googleMapsUrl}`;
  const location = `${SISI_VENUE.name}, ${SISI_VENUE.address}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Date Invitation//SiSi Food and Friends//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:date-sisi-${Date.now()}@invitation.app`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Напоминание о свидании в SiSi Food & Friends через 2 часа!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'date-sisi-friends.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
