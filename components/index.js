// global components
import LanguagesTable from './LanguagesTable/LanguagesTable-server.js'
import Note           from './Note/Note-server.js'
import Notes          from './Notes/Notes-server.js'

// page-specific components
import LexemeDetails from '../pages/Lexeme/LexemeDetails-server.js'
import LexemesTable  from '../pages/Lexemes/LexemesTable-server.js'

export default function addComponentRoutes(app) {
  app.get(`/components/LanguagesTable`, LanguagesTable)
  app.get(`/components/LexemeDetails`, LexemeDetails)
  app.get(`/components/LexemesTable`, LexemesTable)
  app.get(`/components/Note`, Note)
  app.get(`/components/Notes`, Notes)
}
