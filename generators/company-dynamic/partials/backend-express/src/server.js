import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({
    message: 'Express API is running',
    service: '{{name}}',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Express API listening on port ${port}`);
});
