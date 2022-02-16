/**
 * Adds a `state` property to the Context object, for passing state down to the response. This middleware should come first or early in the waterfall.
 */
export default function middleware(ctx, next) {
  ctx.state = {};
  return next();
}
