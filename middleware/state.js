export default function middleware(ctx, next) {

  const state = {
    meta: ctx.meta,
  };

  Object.assign(ctx.state, state);

  return next();

}
