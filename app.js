import http     from 'http';
import { port } from './config.js';

function listener(req, res) {
  res.writeHead(200, { 'Content-Type': `text/plain` });
  res.end(`Oxalis`);
}

function start() {
  console.info(`Server started on port ${ port }. Press Ctrl+C to terminate.`);
}

const server = http.createServer(listener);

server.listen(port, start);
