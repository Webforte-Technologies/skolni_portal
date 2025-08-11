import { Request, Response, NextFunction } from 'express';

export interface MetricsSnapshot {
  total_requests: number;
  avg_response_ms: number;
  error_count_by_status: Record<string, number>;
  started_at: string;
}

const state = {
  totalRequests: 0,
  totalResponseMs: 0,
  errorCountByStatus: {} as Record<string, number>,
  startedAt: new Date(),
};

export const metricsMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    state.totalRequests += 1;
    state.totalResponseMs += duration;
    const status = res.statusCode;
    if (status >= 400) {
      state.errorCountByStatus[String(status)] = (state.errorCountByStatus[String(status)] || 0) + 1;
    }
  });
  next();
};

export const getMetricsSnapshot = (): MetricsSnapshot => {
  const avg = state.totalRequests > 0 ? state.totalResponseMs / state.totalRequests : 0;
  return {
    total_requests: state.totalRequests,
    avg_response_ms: Math.round(avg),
    error_count_by_status: state.errorCountByStatus,
    started_at: state.startedAt.toISOString(),
  };
};


