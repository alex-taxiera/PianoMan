const watch = require('melanke-watchjs').watch

module.exports = class Client {
  constructor (guildInfo, playerInfo) {
    this.guildInfo = guildInfo
    this.playerInfo = playerInfo
    // if playerInfo == null, client needs extra initialization
    if (this.playerInfo == null) {
      this.playerInfo = {
        autoplay: false,
        informNowPlaying: true,
        informAutoPlaying: true,
        volume: 5
      }
    }
    watch(this, () => {
      require('../database.js').updateClient(this.guildInfo.guild.id)
    })
  }
}
