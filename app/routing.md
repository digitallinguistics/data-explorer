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

| Route                                                             | Status | Description                                                                                   |
| ----------------------------------------------------------------- | :----: | --------------------------------------------------------------------------------------------- |
| `/`                                                               |   ☐    | Home Page, with Search/Browse options, and a prompt to log in to view your projects/languages |
| `/account`                                                        |   ☐    | account details page                                                                          |
| ~~`/browse`~~                                                     |   ☐    | ❌                                                                                             |
| `/dashboard`                                                      |   ☐    | Dashboard, with lists of My Projects and My Languages, and Search/Browse options              |
| ~~`/home`~~                                                       |   🚫    | ❌                                                                                             |
| `/languages`                                                      |   ✅    | lists all languages the user has permissions to view                                          |
| `/languages/{languageID}`                                         |   ✅    | language details page                                                                         |
| `/languages/{languageID}/lexemes`                                 |   ✅    | lists the lexemes associated with a language                                                  |
| `/languages/{languageID}/lexemes/{lexemeID}`                      |   ✅    | lexeme details page                                                                           |
| ~~`/lexemes`~~                                                    |   🚫    | ❌                                                                                             |
| ~~`/lexemes/{lexemeID}`~~                                         |   🚫    | ❌                                                                                             |
| ~~`/me`~~                                                         |   🚫    | ❌                                                                                             |
| `/projects`                                                       |   ✅    | lists all projects the user has permissions to view                                           |
| `/projects/{projectID}`                                           |   ✅    | project details page                                                                          |
| `/projects/{projectID}/languages`                                 |   ✅    | lists the languages associated with a project                                                 |
| `/projects/{projectID}/languages/{languageID}`                    |   🚫    | ➡️ `/languages/{languageID}`                                                                   |
| `/projects/{projectID}/languages/{languageID}/lexemes`            |   ✅    | lists the lexemes associated with *both* the project and language                             |
| `/projects/{projectID}/languages/{languageID}/lexemes/{lexemeID}` |   🚫    | ➡️ `/languages/{languageID}/lexemes/{lexemeID}`                                                |
| `/projects/{projectID}/lexemes`                                   |   ✅    | lists the lexemes associated with a project                                                   |
| `/projects/{projectID}/lexemes/{lexemeID}`                        |   🚫    | ➡️ `/languages/{languageID}/lexemes/{lexemeID}`                                                |
| ~~`/search`~~                                                     |   🚫    | ❌ (search happens in individual projects/languages instead)                                   |
| ~~`/users`~~                                                      |   🚫    | ❌                                                                                             |
| ~~`/users/{userID}`~~                                             |   🚫    | ➡️ `/account`                                                                                  |
| `/users/{userID}/languages`                                       |   ☐    | languages associated with a user                                                              |
| `/users/{userID}/projects`                                        |   ☐    | projects associated with a user                                                               |
