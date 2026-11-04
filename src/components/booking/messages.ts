import type { EngineError } from '@profitstudio/booking-engine';
import type { DetailField, Details, FieldErrors } from './types';

/** The shop's words for problems that are not about one field. */
export function problemText(error: EngineError): string {
  switch (error.code) {
    case 'NETWORK':
      return 'We couldn’t reach the booking system. Check your connection and try again.';
    case 'RATE_LIMITED':
      return 'We can’t take more online requests just now. Call or email the shop and we’ll find you a time.';
    case 'NOT_CONFIGURED':
      return 'Online booking is not available yet.';
    case 'SCHEMA_MISSING':
    case 'SCHEMA_INCOMPATIBLE':
      return 'Online booking is temporarily unavailable.';
    case 'BOOKING_DISABLED':
      return 'Online booking is paused right now.';
    default:
      return 'Something went wrong on our side. Please try again.';
  }
}

const SERVER_FIELDS: Record<string, DetailField> = {
  'customer.name': 'name',
  'customer.email': 'email',
  'customer.phone': 'phone',
  notes: 'notes',
};

const SERVER_FIELD_TEXT: Record<DetailField, string> = {
  name: 'Check your name — up to 120 characters.',
  email: 'That email address doesn’t look right. Check for typos.',
  phone: 'Use digits, spaces and + ( ) - only, with at least 5 digits.',
  notes: 'Keep notes under 1,000 characters.',
};

/** INVALID_INPUT from requestBooking: which input to mark, in plain words. */
export function serverFieldError(field: string | undefined): { field: DetailField; text: string } | null {
  if (!field) return null;
  const mapped = SERVER_FIELDS[field];
  return mapped ? { field: mapped, text: SERVER_FIELD_TEXT[mapped] } : null;
}

function hasControlCharacters(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const PHONE_CHARS = /^[\d\s+()./-]+$/;

/** The engine's own rules (INTEGRATION.md §7), checked before sending. */
export function validateDetails(details: Details, requirePhone: boolean): FieldErrors {
  const errors: FieldErrors = {};
  const name = details.name.trim();
  if (!name) errors.name = 'Tell us your name.';
  else if (name.length > 120 || hasControlCharacters(name)) errors.name = 'Use up to 120 characters for your name.';

  const email = details.email.trim();
  if (!email) errors.email = 'Add your email — the code goes there.';
  else if (email.length > 254 || !EMAIL.test(email)) errors.email = 'That email address doesn’t look right. Check for typos.';

  const phone = details.phone.trim();
  if (!phone) {
    if (requirePhone) errors.phone = 'Add a phone number so we can reach you if anything changes.';
  } else {
    const digits = phone.replace(/\D/g, '').length;
    if (phone.length > 40 || !PHONE_CHARS.test(phone) || digits < 5) {
      errors.phone = 'Use digits, spaces and + ( ) - only, with at least 5 digits.';
    }
  }

  if (details.notes.length > 1000) errors.notes = 'Keep notes under 1,000 characters.';
  return errors;
}
