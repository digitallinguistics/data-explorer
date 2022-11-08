// global components
import LanguagesTable from './LanguagesTable/LanguagesTable-server.js'
import Note           from './Note/Note-server.js'
import Notes          from './Notes/Notes-server.js'

export default function addComponentRoutes(app) {
  app.get(`/components/LanguagesTable`, LanguagesTable)
  app.get(`/components/Note`, Note)
  app.get(`/components/Notes`, Notes)
}
