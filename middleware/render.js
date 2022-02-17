import { fileURLToPath } from 'url';
import hbs               from 'handlebars';
import path              from 'path';
import { readFile }      from 'fs/promises';
import recurse           from 'readdirp';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const layoutPath = path.join(__dirname, `../layout/index.hbs`);

let layoutTemplate;

const recurseOptions = {
  depth:      5,
  fileFilter: `*.hbs`,
};

async function getLayout() {
  layoutTemplate = await readFile(layoutPath, `utf8`);
}

/**
 * Registers any partials found in the provided directory.
 * @param {String} dir The directory to register partials from.
 */
async function registerPartials(dir) {
  for await (const entry of recurse(dir, recurseOptions)) {

    const template = await readFile(entry.fullPath, `utf8`);
    const name     = path.basename(entry.path, `.hbs`);

    hbs.registerPartial(name, template);

  }
}

const initialize = Promise.all([
  getLayout(),
  registerPartials(path.join(__dirname, `../components`)),
  registerPartials(path.join(__dirname, `../layout`)),
  registerPartials(path.join(__dirname, `../pages`)),
]);

export default function middleware(ctx, next) {

  ctx.render = async (page, data) => {

    // Cache the layout template and register partials if not already done.
    await initialize;

    // render <main> content
    const pageTemplate = hbs.partials[page];
    const renderMain   = hbs.compile(pageTemplate);
    const context      = Object.assign({}, ctx.state, data);
    const main         = renderMain();

    const pageContext = {
      main,
      page,
      [page]: true,
    };

    // render entire page
    const renderPage = hbs.compile(layoutTemplate);
    const html       = renderPage(Object.assign(context, pageContext));

    ctx.body = html;

  };

  return next();

}
