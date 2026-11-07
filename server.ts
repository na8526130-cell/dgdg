import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'user_profiles.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache loaded from file
let userProfiles: Record<string, any> = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    userProfiles = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user profiles from disk:', e);
    userProfiles = {};
  }
}

function saveProfilesToDisk() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(userProfiles, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save user profiles to disk:', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API endpoints
  // 1. Get all user profiles (sorted by most recently updated)
  app.get('/api/profiles', (_req: Request, res: Response) => {
    const list = Object.values(userProfiles).sort(
      (a: any, b: any) => (b.lastUpdated || 0) - (a.lastUpdated || 0)
    );
    res.json({ success: true, count: list.length, profiles: list });
  });

  // 2. Get specific user profile
  app.get('/api/profiles/:username', (req: Request, res: Response) => {
    const { username } = req.params;
    const profile = userProfiles[username];
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }
    res.json({ success: true, profile });
  });

  // 3. Register or update a user profile
  app.post('/api/profiles', (req: Request, res: Response) => {
    const { username, data, events } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid username is required' });
    }

    const trimmedUsername = username.trim();
    const now = Date.now();
    const existing = userProfiles[trimmedUsername] || {};

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '';

    const updatedProfile = {
      ...existing,
      username: trimmedUsername,
      firstSeenAt: existing.firstSeenAt || new Date().toLocaleString('ja-JP'),
      lastSeenAt: new Date().toLocaleString('ja-JP'),
      lastUpdated: now,
      serverDetectedIp: clientIp,
      visitCount: (existing.visitCount || 0) + 1,
      sessionDurationSeconds: data?.session?.sessionDurationSeconds || 0,
      ip: data?.ipGeo?.ip || clientIp,
      ipGeo: data?.ipGeo || existing.ipGeo,
      deviceGeo: data?.deviceGeo || existing.deviceGeo,
      browser: data?.browser || existing.browser,
      hardware: data?.hardware || existing.hardware,
      network: data?.network || existing.network,
      eventsCount: events?.length || (existing.recentEvents?.length || 0),
      recentEvents: events ? events.slice(0, 100) : (existing.recentEvents || []),
      fullDataSnapshot: data || existing.fullDataSnapshot,
    };

    userProfiles[trimmedUsername] = updatedProfile;
    saveProfilesToDisk();

    res.json({ success: true, profile: updatedProfile });
  });

  // 4. Delete single user profile
  app.delete('/api/profiles/:username', (req: Request, res: Response) => {
    const { username } = req.params;
    if (userProfiles[username]) {
      delete userProfiles[username];
      saveProfilesToDisk();
      return res.json({ success: true, message: `User ${username} deleted` });
    }
    res.status(404).json({ success: false, message: 'User not found' });
  });

  // 5. Clear all user profiles
  app.delete('/api/profiles', (_req: Request, res: Response) => {
    userProfiles = {};
    saveProfilesToDisk();
    res.json({ success: true, message: 'All user profiles cleared' });
  });

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', userCount: Object.keys(userProfiles).length });
  });

  // Vite integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
