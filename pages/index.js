import About           from './About/About-server.js'
import Dictionaries    from './Dictionaries/Dictionaries-server.js'
import Home            from './Home/Home-server.js'
import Language        from './Language/Language-server.js'
import LanguageLexemes from './LanguageLexemes/LanguageLexemes-server.js'
import Languages       from './Languages/Languages-server.js'
import Lexeme          from './Lexeme/Lexeme-server.js'
import Project         from './Project/Project-server.js'
import ProjectLexemes  from './ProjectLexemes/ProjectLexemes-server.js'
import Projects        from './Projects/Projects-server.js'

import {
  PageNotFound,
  ServerError,
  ServerErrorTest,
} from './Error/Error-server.js'

export default {
  About,
  Dictionaries,
  Home,
  Language,
  LanguageLexemes,
  Languages,
  Lexeme,
  PageNotFound,
  Project,
  ProjectLexemes,
  Projects,
  ServerError,
  ServerErrorTest,
}
