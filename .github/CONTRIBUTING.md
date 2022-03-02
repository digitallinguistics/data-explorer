# Contributor Guidelines

🌟Thank you🌟 for contributing to the Oxalis app!

- Have a question? [Check out the Q&A.][discussions]
- Found a bug or need to report a problem? [Open an issue.][bug-report]
- Want to request a feature? [Open a feature request.][feature-request]
- Want to contribute code to Oxalis? Check out [GitHub's Open Source Guide]

## Contents

- [Contributor Guidelines](#contributor-guidelines)
  - [Contents](#contents)

## Overview

Oxalis is a multi-page app focused on allowing users to view, search/filter, and aggregate linguistic data of various types (texts, utterances, and lexical items). Because it is a data-intensive app and aims to manage large volumes of scientific data, performance is a key consideration. As such, most data-related operations will take place on the server, and be delivered to the user as (mostly-)static HTML pages.

## Project Principles

Develops should keep the following aims and principles in mind when designing and implementing features for Oxalis.

- **community orientation:** The data in Oxalis should be accessible to non-specialists like speakers and community members, in addition to research linguists.

- **ethics and data privacy:** Developers should be sensitive to the fact that different datasets have different privacy requirements and ethical considerations. Users should be given full flexibility to manage access permissions for their data.

- **linguistic diversity:** Oxalis aims to support data from any language in the world, and therefore needs to avoid Indo-European bias. This includes allowing for choice of RTL and LTR writing across the app, choices of font, etc.

- [**Principles of Data Citation in Linguistics:**][Austin] A key goal of this project is to make linguistic data accessible, discoverable, and verifiable, all while adhereing to ethical concerns regarding data management in documentary linguistics.

- **mobile support:** Users should be able to easily access data across a variety of devices of different screen sizes and internet speeds. This is especially important for rural communities that may be using the app.

- **open source:** Digital Linguistics is committed to open source development.

- **scientific transparency:** Data in Oxalis should be easily citable and search results replicable.

## Getting Started

1. Install the latest LTS version of [Node]. If you need to use multiple versions of Node on the same computer, consider using [nvm] (Unix, MacOS, and Windows WSL) or [nvm-windows].

2. Clone the repository and `cd` into its folder:

    ```cmd
    > git clone https://github.com/digitallinguistics/data-explorer.git
    > cd data-explorer
    ```

    If you're unfamiliar with the command line, you may way to install [GitHub Desktop], an easy-to-use interface for syncing your code with git repositories.

3. Install the software dependencies for the project.

    ```cmd
    > npm install
    ```

4. Start a local server.

    ```cmd
    > npm start
    ```

5. Visit <https://localhost:3001> to view the app.

## Technologies & Developer Tools

This app is developed using the [Express] framework, and [Handlebars] templates for rendering.

This project uses the following developer tools:

- [Chai]
- [ESLint]
- [Mocha]
- [nodemon]

## Testing the App

Oxalis currently only has unit tests, which are written in [Chai] + [Mocha] and can be run using `npm test`.

- Each service should have its own unit test suite.
- Each endpoint and method get its own unit test.
- Middleware should be tested by checking its effects on the server response.

## Resources

### Images

DLx projects use [Feather Icons][Feather] for UI purposes by default. More decorative icons can be found at [Flaticon]. Generally, UI icons should be black and white with rounded edges, while decorative icons should be colorful and flat with sharp edges.

## Versioning

Oxalis loosely follows [semantic versioning principles][semver].

- **major:** Significant change to UI or existing functionality.
- **minor:** Addition of new functionality, such as a new page.
- **patch:** Bug fixes and updates to documentation.

<!-- LINKS -->
[Austin]:          https://site.uit.no/linguisticsdatacitation/austinprinciples/
[bug-report]:      https://github.com/digitallinguistics/data-explorer/issues/new?labels=🐞%20bug&template=bug_report.md
[Chai]:            https://www.chaijs.com/
[discussions]:     https://github.com/digitallinguistics/data-explorer/discussions/categories/q-a
[ESLint]:          https://eslint.org/
[Express]:         http://expressjs.com/
[Feather]:         https://feathericons.com/
[feature-request]: https://github.com/digitallinguistics/data-explorer/issues/new?labels=🎁%20feature&template=feature_request.md
[Flaticon]:        https://www.flaticon.com/
[GitHub-Desktop]:  https://desktop.github.com/
[Handlebars]:      https://handlebarsjs.com/
[Mocha]:           https://mochajs.org/
[Node]:            https://nodejs.org/en/
[nodemon]:         https://nodemon.io/
[nvm]:             https://github.com/nvm-sh/nvm
[nvm-windows]:     https://github.com/coreybutler/nvm-windows
[open-source]:     https://opensource.guide/how-to-contribute/
[semver]:          https://semver.org/
