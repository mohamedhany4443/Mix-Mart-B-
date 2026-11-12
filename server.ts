import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'branch-state.json');

interface BranchState {
  version: number;
  updatedAt: string;
  categories?: unknown[];
  drinks?: unknown[];
  orders?: unknown[];
  settings?: Record<string, unknown>;
  feedbacks?: unknown[];
  tableClosureRequests?: unknown[];
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadInitialState(): BranchState {
  try {
    ensureDataDir();
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as BranchState;
      if (parsed && typeof parsed === 'object') {
        return {
          version: typeof parsed.version === 'number' ? parsed.version : 1,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
          categories: Array.isArray(parsed.categories) ? parsed.categories : undefined,
          drinks: Array.isArray(parsed.drinks) ? parsed.drinks : undefined,
          orders: Array.isArray(parsed.orders) ? parsed.orders : undefined,
          settings:
            parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : undefined,
          feedbacks: Array.isArray(parsed.feedbacks) ? parsed.feedbacks : undefined,
          tableClosureRequests: Array.isArray(parsed.tableClosureRequests)
            ? parsed.tableClosureRequests
            : undefined,
        };
      }
    }
  } catch (err) {
    console.error('Failed to read branch-state.json, starting fresh:', err);
  }
  return {
    version: 0,
    updatedAt: new Date().toISOString(),
  };
}

let branchState: BranchState = loadInitialState();
const sseClients = new Set<express.Response>();

function persistState(state: BranchState): void {
  try {
    ensureDataDir();
    const tmpFile = `${STATE_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tmpFile, STATE_FILE);
  } catch (err) {
    console.error('Failed to persist branch-state.json:', err);
  }
}

function broadcastEvent(payload: Record<string, unknown>): void {
  const dataStr = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(dataStr);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      version: branchState.version,
      clients: sseClients.size,
      updatedAt: branchState.updatedAt,
    });
  });

  app.get('/api/branch/state', (_req, res) => {
    res.json(branchState);
  });

  app.get('/api/branch/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);
    res.write(
      `data: ${JSON.stringify({
        type: 'connected',
        version: branchState.version,
        state: branchState,
      })}\n\n`
    );

    const heartbeat = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  app.post('/api/branch/sync', (req, res) => {
    const body = req.body as {
      clientId?: string;
      patch?: Partial<BranchState>;
    };

    if (!body || !body.patch || typeof body.patch !== 'object') {
      res.status(400).json({ error: 'Invalid sync payload' });
      return;
    }

    const patch = body.patch;
    const nextState: BranchState = {
      ...branchState,
      version: branchState.version + 1,
      updatedAt: new Date().toISOString(),
    };

    if (Array.isArray(patch.categories)) nextState.categories = patch.categories;
    if (Array.isArray(patch.drinks)) nextState.drinks = patch.drinks;
    if (Array.isArray(patch.orders)) nextState.orders = patch.orders;
    if (patch.settings && typeof patch.settings === 'object') {
      nextState.settings = patch.settings;
    }
    if (Array.isArray(patch.feedbacks)) nextState.feedbacks = patch.feedbacks;
    if (Array.isArray(patch.tableClosureRequests)) {
      nextState.tableClosureRequests = patch.tableClosureRequests;
    }

    branchState = nextState;
    persistState(branchState);

    broadcastEvent({
      type: 'sync',
      clientId: body.clientId || null,
      version: branchState.version,
      state: branchState,
    });

    res.json({ ok: true, version: branchState.version, updatedAt: branchState.updatedAt });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    process.env.DISABLE_HMR = 'true';
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        watch: null,
      },
      appType: 'spa',
    });

    app.get('/@vite/client', async (_req, res, next) => {
      try {
        const result = await vite.transformRequest('/@vite/client');
        if (!result) {
          next();
          return;
        }
        const safeClientCode = result.code.replace(
          'transport.connect(createHMRHandler(handleMessage));',
          '/* HMR WebSocket disabled in AI Studio */'
        );
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(safeClientCode);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use('/src/assets/images', express.static(path.join(__dirname, 'src/assets/images')));
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MIX MART 4-App Branch Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
