import 'babel-polyfill' // This is for to run babel-parsed code with async/await
import Express from 'express'
import {graphqlExpress, graphiqlExpress} from 'apollo-server-express'
import ServeStatic from 'serve-static'
import bodyParser from 'body-parser'
import schema from './schema'
require('dotenv').config()

const APP_PORT = 8888
const app = Express()
app.use(ServeStatic(__dirname))
app.use(
  '/api',
  bodyParser.json({limit: '5mb'}),
  graphqlExpress(() => ({
    schema,
  }))
)
app.use('/graphiql', graphiqlExpress({endpointURL: 'api'}))

app.listen(process.env.PORT || APP_PORT, () => {
  console.log(`NKShop listening on port ${APP_PORT} ...`)
})
