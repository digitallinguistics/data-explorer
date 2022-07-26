import MultiLangString from './MultiLangString/MultiLangString-server.js'
import Note            from './Note/Note-server.js'
import Notes           from './Notes/Notes-server.js'
import Transcription   from './Transcription/Transcription-server.js'

export default function addComponentRoutes(app) {
  app.get(`/components/MultiLangString`, MultiLangString)
  app.get(`/components/Note`, Note)
  app.get(`/components/Notes`, Notes)
  app.get(`/components/Transcription`, Transcription)
}
