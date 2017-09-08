module.exports = class Player {
  constructor () {
    this.isPlaying = false
    this.paused = false
    this.nowPlaying = {}
    this.queue = []
    this.encoder = {}
  }
}
