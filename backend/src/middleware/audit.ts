import { Response, NextFunction } from 'express';
import { RequestWithUser } from './auth';
import pool from '../database/connection';

export const auditLoggerForAdmin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalEnd = res.end;
  let statusCode = 200;

  // Wrap res.end to capture final status code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (res as any).end = function (...args: any[]) {
    statusCode = res.statusCode;
    originalEnd.apply(res, args as any);
  } as typeof res.end;

  res.on('finish', async () => {
    try {
      const userId = req.user?.id || null;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const ua = req.headers['user-agent'] || '';
      const durationMs = Date.now() - start;
      const meta: Record<string, unknown> = {};
      // Include a tiny meta, avoid sensitive payload
      if (req.method !== 'GET') {
        const body = req.body || {};
        for (const key of Object.keys(body)) {
          if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) continue;
          if (typeof body[key] === 'string' || typeof body[key] === 'number' || typeof body[key] === 'boolean') {
            meta[key] = body[key];
          }
        }
      }
      meta['duration_ms'] = durationMs;

      await pool.query(
        `INSERT INTO audit_logs (user_id, method, path, status_code, action, ip, user_agent, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, req.method, req.originalUrl, statusCode, undefined, ip, ua, JSON.stringify(meta)]
      );
    } catch (e) {
      // swallow audit logging errors
      // console.error('Audit log error', e);
    }
  });

  next();
};


