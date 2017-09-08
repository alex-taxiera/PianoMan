module.exports = class Response {
  constructor (message, content, delay, embed) {
    this.message = message
    this.content = content
    if (delay) {
      this.delay = delay
    } else {
      this.delay = 10000
    }
    this.embed = embed
  }
}
