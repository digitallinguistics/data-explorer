import Koa      from 'koa';
import { port } from './config.js';

function listener(ctx) {
  ctx.body = `Oxalis`;
}

function start() {
  console.info(`Server started on port ${ port }. Press Ctrl+C to terminate.`);
}

const app = new Koa();

app
.use(listener)
.listen(port, start);
