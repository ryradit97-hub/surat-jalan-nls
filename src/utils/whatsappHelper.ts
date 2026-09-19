/**
 * Formats standard Indonesian phone numbers to international WhatsApp format (e.g. 0812... -> 62812...)
 */
export function formatIndonesianPhone(phoneStr?: string): string {
  if (!phoneStr) return '';
  // Remove non-digit characters
  let cleaned = phoneStr.replace(/\D/g, '');
  if (!cleaned) return '';

  // If starts with 08..., convert to 628...
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}

/**
 * Directly opens WhatsApp chat for the driver with an empty/clean message
 */
export function openWhatsAppDirect(phone?: string): void {
  const cleanPhone = formatIndonesianPhone(phone);
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}`
    : `https://web.whatsapp.com/`;

  window.open(url, '_blank', 'noopener,noreferrer');
}
