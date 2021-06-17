const HTTP = require('http')
const express = require('express')
const app = express()
const http = HTTP.createServer(app)

// 公开文件
// eslint-disable-next-line
app.use(express.static(__dirname + '/dist'))

// listen 函数监听端口
const server = http.listen(3000, '0.0.0.0', function () {
  let ip = server.address().address
  const obj = require('os').networkInterfaces()
  for (const k in obj) {
    for (const k2 in obj[k]) {
      const e = obj[k][k2]
      if (e.family === 'IPv4' && !e.internal) {
        ip = e.address
        break
      }
    }
  }
  const port = server.address().port
  console.log('应用实例，访问地址为 http://%s:%s', ip, port)
  console.log('应用实例，访问地址为 http://localhost:%s', port)
})
