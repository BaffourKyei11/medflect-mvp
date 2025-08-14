import { Queue, Worker, JobsOptions, QueueEvents } from 'bullmq';
import RedisModule from 'ioredis';

let queue: Queue | null = null;
let worker: Worker | null = null;
let events: QueueEvents | null = null;

// Support both CJS and ESM shapes of ioredis
const RedisCtor: any = (RedisModule as any)?.default || (RedisModule as any);

function getRedisConnection() {
  const url = process.env.REDIS_URL;
  if (url) return new RedisCtor(url, { maxRetriesPerRequest: null });
  const host = process.env.REDIS_HOST || 'localhost';
  const port = Number(process.env.REDIS_PORT || 6379);
  const password = process.env.REDIS_PASSWORD || undefined;
  return new RedisCtor({ host, port, password, maxRetriesPerRequest: null });
}

export async function initAIWorker() {
  if (queue) return; // already initialized
  const connection = getRedisConnection();
  queue = new Queue('ai-jobs', { connection });
  events = new QueueEvents('ai-jobs', { connection });

  // Simple worker that logs job payload; extend later to call upstreams
  worker = new Worker(
    'ai-jobs',
    async (job: any) => {
      console.log('[AI-Worker] Processing job', job.id, job.name, job.data);
      // TODO: route to specific processors (e.g., summaries) as needed
      return { ok: true };
    },
    { connection }
  );

  events.on('completed', ({ jobId }) => {
    console.log('[AI-Worker] Completed', jobId);
  });
  events.on('failed', ({ jobId, failedReason }) => {
    console.warn('[AI-Worker] Failed', jobId, failedReason);
  });
}

export async function enqueueAIJob(name: string, data: any, opts: JobsOptions = {}) {
  if (!queue) throw new Error('AI queue not initialized');
  const job = await queue.add(name, data, {
    removeOnComplete: { count: 1000, age: 3600 },
    removeOnFail: { count: 1000, age: 86400 },
    attempts: Number(process.env.JOB_ATTEMPTS || 2),
    backoff: { type: 'exponential', delay: Number(process.env.JOB_BACKOFF_MS || 2000) },
    ...opts,
  });
  console.log('[AI-Worker] Enqueued job', job.id, name);
  return job.id;
}

export async function shutdownAIWorker() {
  try { await worker?.close(); } catch {}
  try { await events?.close(); } catch {}
  try { await queue?.close(); } catch {}
  queue = null; events = null; worker = null;
  console.log('[AI-Worker] Shutdown complete');
}
