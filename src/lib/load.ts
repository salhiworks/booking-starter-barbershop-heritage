import type { EngineError, Result } from '@profitstudio/booking-engine';

/** The state of one engine read, for rendering loading / ready / error. */
export type Load<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; error: EngineError };

export const LOADING = { status: 'loading' } as const;

export function fromResult<T>(result: Result<T>): Load<T> {
  return result.ok ? { status: 'ready', data: result.data } : { status: 'error', error: result.error };
}

/** Errors that mean "no online booking here at all" rather than "try again". */
export function isSetupError(error: EngineError): boolean {
  return (
    error.code === 'NOT_CONFIGURED' ||
    error.code === 'SCHEMA_MISSING' ||
    error.code === 'SCHEMA_INCOMPATIBLE'
  );
}
