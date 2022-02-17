export default function middleware(ctx, next) {
  Object.assign(ctx.state, ctx.context);
  delete ctx.context;
  return next();
}
