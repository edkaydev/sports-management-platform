import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import * as activity from '../modules/activity/activity.service';
import { isSkipped, summarize, actionFor, getEntityId, fileUrlFromRequest } from '../modules/activity/activity.helper';

export function activityLogger(req: Request, res: Response, next: NextFunction) {
  res.on('finish', () => {
    const run = async () => {
      if (res.statusCode < 200 || res.statusCode >= 300) return;
      if (isSkipped(req.url, req.method)) return;

      const user = (req as any).user as { id?: string; role?: string } | undefined;
      if (!user?.id) return;

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { fullName: true, username: true },
      });
      if (!dbUser) return;

      const { summary, entityType } = summarize(req.method, req.url);
      const { fileUrl, fileName } = fileUrlFromRequest(req);

      await activity.record({
        userId: user.id,
        userName: dbUser.fullName || dbUser.username,
        action: actionFor(req.method),
        summary,
        entityType,
        entityId: getEntityId(req),
        fileUrl,
        fileName,
      });
    };

    run().catch(() => {
      // Logging activity must never break a request.
    });
  });

  next();
}