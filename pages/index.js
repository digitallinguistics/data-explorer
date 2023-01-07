import About           from './About/About-server.js'
import Dictionaries    from './Dictionaries/Dictionaries-server.js'
import Home            from './Home/Home-server.js'
import Language        from './Language/Language-server.js'
import LanguageLexemes from './Lexemes/LanguageLexemes-server.js'
import Languages       from './Languages/Languages-server.js'
import Lexeme          from './Lexeme/Lexeme-server.js'
import Lexemes         from './Lexemes/Lexemes-server.js'
import Project         from './Project/Project-server.js'
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
  Lexemes,
  PageNotFound,
  Project,
  Projects,
  ServerError,
  ServerErrorTest,
}
