import http from 'http';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

console.log(`🍣 Preparing SushiFlow & RoboFlow server on http://${hostname}:${port} ...`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function start() {
  await app.prepare();
  const server = http.createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Request handler error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, hostname, () => {
    console.log(`\n======================================================`);
    console.log(`  🎉 AI Agent Game Server is LIVE & READY!`);
    console.log(`  🍣 壽司物語 AI (Sushi Restaurant): http://localhost:${port}/sushi`);
    console.log(`  🚚 RoboFlow (Fleet Logistics):      http://localhost:${port}`);
    console.log(`======================================================\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
