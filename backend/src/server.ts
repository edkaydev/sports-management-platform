import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { logger } from './config/logger';
import { verifyAccessToken } from './config/jwt';
import { setIO } from './config/socket';

const PORT = process.env.PORT ?? 3000;

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Socket auth middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Missing token'));
    const payload = verifyAccessToken(token);
    (socket as any).userId = (payload as any).userId ?? (payload as any).sub;
    (socket as any).userRole = (payload as any).role;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId: string = (socket as any).userId;
  const role: string = (socket as any).userRole;

  if (userId) {
    socket.join(`user:${userId}`);
    socket.join(`role:${role}`);
    socket.join('all');
  }

  logger.info(`[WS] connected userId=${userId} role=${role}`);

  socket.on('disconnect', () => {
    logger.info(`[WS] disconnected userId=${userId}`);
  });
});

// Store io instance for use in services
setIO(io);

httpServer.listen(PORT, () => {
  logger.info(`API running on port ${PORT} [${process.env.NODE_ENV}]`);
});
