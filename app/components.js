import MultiLangString from '../components/MultiLangString/MultiLangString-server.js'

export default function addComponentRoutes(app) {
  app.get(`/components/MultiLangString`, MultiLangString)
}
