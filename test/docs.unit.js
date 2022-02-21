import { expect }        from 'chai';
import { fileURLToPath } from 'url';
import { readFile }      from 'fs/promises';

import {
  dirname as getDirname,
  join as joinPath,
} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = getDirname(__filename);

describe(`docs`, function() {

  it(`have the correct year`, async function() {

    const licensePath = joinPath(__dirname, `../LICENSE.md`);
    const licenseText = await readFile(licensePath, `utf8`);
    const currentYear = new Date().getFullYear();
    const yearText    = `2019–${ currentYear }`;

    expect(licenseText).to.include(yearText);

  });

});
