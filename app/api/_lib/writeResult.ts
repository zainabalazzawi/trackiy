/** Shared ok/fail Result shape used by boardLane and ticketWrite. */
export type WriteResult<T, C extends string> =
  | { ok: true; data: T }
  | { ok: false; code: C; message: string };

export const fail = <C extends string>(
  code: C,
  message: string
): { ok: false; code: C; message: string } => ({
  ok: false,
  code,
  message,
});

export const ok = <T>(data: T): { ok: true; data: T } => ({ ok: true, data });
