import type { Server as SocketIOServer } from 'socket.io';

let _io: SocketIOServer | null = null;

export function setIO(io: SocketIOServer) {
  _io = io;
}

export function getIO(): SocketIOServer | null {
  return _io;
}

// ─── Emit helpers ──────────────────────────────────────────────────────────────

export function emitDomainUpdate(
  domain:
    | 'athlete'
    | 'sport'
    | 'team'
    | 'event'
    | 'match'
    | 'scholarship'
    | 'contract'
    | 'notification'
    | 'news'
    | 'slides',
  data?: Record<string, unknown>
) {
  if (!_io) return;
  _io.to('all').emit(`${domain}:update`, { domain, timestamp: Date.now(), ...data });
}

export function emitNotificationNew(recipientUserId: string, notification: Record<string, unknown>) {
  if (!_io) return;
  _io.to(`user:${recipientUserId}`).emit('notification:new', notification);
}

export function emitToUser(userId: string, event: string, data?: unknown) {
  if (!_io) return;
  _io.to(`user:${userId}`).emit(event, data);
}

export function emitToRole(role: string, event: string, data?: unknown) {
  if (!_io) return;
  _io.to(`role:${role}`).emit(event, data);
}

export function emitToAll(event: string, data?: unknown) {
  if (!_io) return;
  _io.to('all').emit(event, data);
}
