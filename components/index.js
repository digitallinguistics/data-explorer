// global components
import LanguagesTable  from './LanguagesTable/LanguagesTable-server.js'
import MultiLangString from './MultiLangString/MultiLangString-server.js'
import Note            from './Note/Note-server.js'
import Notes           from './Notes/Notes-server.js'
import Transcription   from './Transcription/Transcription-server.js'

// page-specific components
import LanguageDetails from '../pages/Languages/LanguageDetails-server.js'
import LexemeDetails   from '../pages/Lexeme/LexemeDetails-server.js'
import LexemesTable    from '../pages/Lexemes/LexemesTable-server.js'
import ProjectDetails  from '../pages/Project/ProjectDetails-server.js'

export default function addComponentRoutes(app) {
  app.get(`/components/LanguageDetails`, LanguageDetails)
  app.get(`/components/LanguagesTable`, LanguagesTable)
  app.get(`/components/LexemeDetails`, LexemeDetails)
  app.get(`/components/LexemesTable`, LexemesTable)
  app.get(`/components/MultiLangString`, MultiLangString)
  app.get(`/components/Note`, Note)
  app.get(`/components/Notes`, Notes)
  app.get(`/components/ProjectDetails`, ProjectDetails)
  app.get(`/components/Transcription`, Transcription)
}
