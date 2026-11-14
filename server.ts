import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.use(cors({
  origin: 'https://ecosan-ai.vercel.app' // Điền link Vercel của bạn vào đây
}));
app.use(express.json({ limit: '25mb' }));

// ==========================================
// 1. KHỞI TẠO DATABASE SQLITE
// ==========================================
const db = new Database('ecoscan.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS waste_logs (
    id TEXT PRIMARY KEY,
    itemName TEXT NOT NULL,
    category TEXT NOT NULL,
    categoryNameVi TEXT NOT NULL,
    confidence REAL,
    primaryMaterial TEXT,
    recyclabilityScore INTEGER,
    estimatedWeightGrams REAL,
    co2SavedKg REAL,
    binColor TEXT,
    loggedAt TEXT NOT NULL
  )
`);

// ==========================================
// 2. API DATABASE (LƯU & LẤY LOG)
// ==========================================
app.post('/api/logs', (req: Request, res: Response) => {
  try {
    const {
      id, itemName, category, categoryNameVi, confidence,
      primaryMaterial, recyclabilityScore, estimatedWeightGrams,
      co2SavedKg, binColor, loggedAt
    } = req.body;

    if (!id || !itemName || !loggedAt) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const stmt = db.prepare(`
      INSERT INTO waste_logs 
      (id, itemName, category, categoryNameVi, confidence, primaryMaterial, recyclabilityScore, estimatedWeightGrams, co2SavedKg, binColor, loggedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, itemName, category, categoryNameVi, confidence, primaryMaterial, recyclabilityScore, estimatedWeightGrams, co2SavedKg, binColor, loggedAt);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('DB Insert Error:', error);
    res.status(500).json({ error: 'Lỗi lưu database: ' + error.message });
  }
});

app.get('/api/logs', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM waste_logs ORDER BY loggedAt DESC').all();
    // Map lại dữ liệu để Frontend dễ dùng
    const mappedRows = rows.map((row: any) => ({
      ...row,
      // Các trường này lưu dạng text dài, ta chỉ cần dummy data để hiển thị
      materials: [],
      recyclabilityExplanation: 'Dữ liệu lịch sử được lưu trữ.',
      binNameVi: row.binColor === 'blue' ? 'Thùng Xanh Dương' : row.binColor === 'green' ? 'Thùng Xanh Lá' : row.binColor === 'red' ? 'Thùng Đỏ' : 'Thùng Xám',
      disposalSteps: ['Dữ liệu chi tiết không được lưu trữ.'],
      doNotDo: ['Dữ liệu chi tiết không được lưu trữ.'],
      decompositionTime: 'Không rõ',
      upcyclingIdeas: [],
      timestamp: row.loggedAt,
    }));
    res.json(mappedRows);
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi lấy dữ liệu: ' + error.message });
  }
});

app.delete('/api/logs/:id', (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM waste_logs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi xóa dữ liệu' });
  }
});

app.delete('/api/logs', (_req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM waste_logs');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi xóa dữ liệu' });
  }
});

// ==========================================
// 3. KHỞI ĐỘNG SERVER & VITE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server Backend chạy tại http://localhost:${PORT}`);
    console.log(`✅ Database SQLite đã sẵn sàng: ecoscan.db`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});