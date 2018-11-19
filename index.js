export default class WSHeartbeat {
  // websocket对象
  ws = null
  // 240s/4min nginx设置了5分钟超时断开
  pingTimeout = 4 * 60 * 1000
  pongTimeout = 20 * 1000
  pingTimer = null
  pongTimer = null
  pingData = ''

  constructor ({ ws, pingTimeout, pongTimeout, data }) {
    this.ws = ws
    this.pingTimeout = pingTimeout || this.pingTimeout
    this.pongTimeout = pongTimeout || this.pongTimeout
    this.pingData = data
  }

  start () {
    console.log('启动心跳检测')
    this.reset()
    this.pingTimer = setTimeout(() => {
      console.log('心跳检测时间：', new Date())
      const pingData = {
        type: 'ping',
        value: typeof this.pingData === 'function' ? this.pingData() : this.pingData
      }
      this.ws.send(JSON.stringify(pingData))

      // 服务器超时未响应时，主动关闭
      this.pongTimer = setTimeout(() => {
        console.log('心跳检测，服务端超时，主动关闭websocket')
        this.ws.close()
      }, this.pongTimeout)
    }, this.pingTimeout)
  }

  reset () {
    if (this.pingTimer) {
      clearTimeout(this.pingTimer)
    }

    if (this.pongTimer) {
      clearTimeout(this.pongTimer)
    }

    return this
  }
}
