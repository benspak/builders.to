import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const staticDir = join(__dirname, 'dist');

// Serve static files from dist directory with fallthrough option
// This allows the catch-all route to handle non-existent files
app.use(express.static(staticDir, { fallthrough: true }));

// Serve index.html for all routes that don't match static files (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Frontend server running on port ${PORT}`);
  console.log(`📁 Serving static files from ${staticDir}`);
  console.log(`🔀 SPA routing enabled - all routes serve index.html`);
});
