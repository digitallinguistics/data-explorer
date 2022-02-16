import Koa from 'koa';
import { render, state } from './middleware/index.js';

/**
 * Returns the same response for every request.
 */
function listener(ctx) {
  ctx.render(`Home`);
}

// Initialize Koa
const app = new Koa();

// Settings
app.env   = process.env.NODE_ENV ?? `localhost`;
app.port  = process.env.PORT ?? 3001;
app.proxy = true; // trust the Azure proxy

// Middleware
app
.use(state)
.use(render)
.use(listener);

// Start server
app.listen(app.port, () => console.info(`Server started on port ${ app.port } in ${ app.env } mode. Press Ctrl+C to terminate.`));
