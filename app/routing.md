# Routing

Each of the routes displaying lists should eventually have search/filter/sort functionality on them.
They should also make it clear exactly what set of items is being displayed
(e.g. all public languages, all languages associated with a project, all languages associated with a user, etc.).

## Statuses

- ☐ to do
- 🏗️ in progress
- ✅ done
- 🚫 won't do

## Routes

| Route                                                             | Status | Description                                                                                                   |
| ----------------------------------------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------- |
| `/`                                                               |   ☐    | Home Page, with Search/Browse options, and a prompt to log in to view your projects/languages                 |
| `/browse`                                                         |   ☐    | landing page, directing users to Languages, Lexemes, or Projects pages                                        |
| `/codes`                                                          |   ☐    | landing page, directing users to search or browse by Glottocode or ISO codes                                  |
| `/codes/{glottolog‖iso}`                                          |   ☐    | list of Glottocodes in the database, with stats on the # of public/private languages and lexemes              |
| `/codes/{glottolog‖iso}/{code}`                                   |   ☐    | list of languages with the given code                                                                         |
| `/dashboard`                                                      |   ☐    | Dashboard, with lists of My Projects and My Languages, and Search/Browse options                              |
| ~~`/home`~~                                                       |   🚫    | ❌                                                                                                             |
| `/languages`                                                      |   ✅    | lists all languages the user has permissions to view                                                          |
| `/languages/{languageID}`                                         |   ✅    | language details page                                                                                         |
| `/languages/{languageID}/lexemes`                                 |   ✅    | lists the lexemes associated with a language                                                                  |
| `/languages/{languageID}/lexemes/{lexemeID}`                      |   ✅    | lexeme details page                                                                                           |
| ~~`/lexemes`~~                                                    |   🚫    | ❌                                                                                                             |
| ~~`/lexemes/{lexemeID}`~~                                         |   🚫    | ❌                                                                                                             |
| ~~`/me`~~                                                         |   🚫    | ❌                                                                                                             |
| `/projects`                                                       |   ✅    | lists all projects the user has permissions to view                                                           |
| `/projects/{projectID}`                                           |   ✅    | project details page                                                                                          |
| `/projects/{projectID}/languages`                                 |   ✅    | lists the languages associated with a project                                                                 |
| `/projects/{projectID}/languages/{languageID}`                    |   🚫    | ➡️ `/languages/{languageID}`                                                                                   |
| `/projects/{projectID}/languages/{languageID}/lexemes`            |   ✅    | lists the lexemes associated with *both* the project and language                                             |
| `/projects/{projectID}/languages/{languageID}/lexemes/{lexemeID}` |   🚫    | ➡️ `/languages/{languageID}/lexemes/{lexemeID}`                                                                |
| `/projects/{projectID}/lexemes`                                   |   ✅    | lists the lexemes associated with a project                                                                   |
| `/projects/{projectID}/lexemes/{lexemeID}`                        |   🚫    | ➡️ `/languages/{languageID}/lexemes/{lexemeID}`                                                                |
| `/search`                                                         |   ☐    | <p>landing page, directing users to search languages, lexemes, or projects<br>OR<br>multi-use search page</p> |
| ~~`/users`~~                                                      |   🚫    | ❌                                                                                                             |
| `/users/{userID}`                                                 |   ☐    | user details page (editable; viewable only that user)                                                         |
| `/users/{userID}/languages`                                       |   ☐    | languages associated with a user                                                                              |
| `/users/{userID}/projects`                                        |   ☐    | projects associated with a user                                                                               |
