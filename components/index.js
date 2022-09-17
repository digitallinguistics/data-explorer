// global components
import DefinitionList  from './DefinitionList/DefinitionList-server.js'
import LanguagesTable  from './LanguagesTable/LanguagesTable-server.js'
import MultiLangString from './MultiLangString/MultiLangString-server.js'
import Note            from './Note/Note-server.js'
import Notes           from './Notes/Notes-server.js'
import Transcription   from './Transcription/Transcription-server.js'

// page-specific components
import LexemeDetails from '../pages/Lexeme/LexemeDetails-server.js'
import LexemesTable  from '../pages/Lexemes/LexemesTable-server.js'

export default function addComponentRoutes(app) {
  app.get(`/components/DefinitionList`, DefinitionList)
  app.get(`/components/LanguagesTable`, LanguagesTable)
  app.get(`/components/LexemeDetails`, LexemeDetails)
  app.get(`/components/LexemesTable`, LexemesTable)
  app.get(`/components/MultiLangString`, MultiLangString)
  app.get(`/components/Note`, Note)
  app.get(`/components/Notes`, Notes)
  app.get(`/components/Transcription`, Transcription)
}
