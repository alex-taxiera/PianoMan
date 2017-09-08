const music = require('../music.js')
const db = require('../database.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'toggle',
  'Toggle various settings',
  [`Alias: auto|np|autonp`],
  'VIP',
  function (msg, params) {
    let id = msg.guild.id
    let playerInfo = db.getPlayerInfo(id)
    let str = ''

    switch (params[0]) {
      case 'auto':
        playerInfo.autoplay = !playerInfo.autoplay
        music.checkPlayer(id)
        str = `Autoplay set to ${playerInfo.autoplay}!`
        break
      case 'np':
        playerInfo.informNowPlaying = !playerInfo.informNowPlaying
        str = `Now Playing announcements set to ${playerInfo.informNowPlaying}!`
        break
      case 'autonp':
        playerInfo.informAutoPlaying = !playerInfo.informAutoPlaying
        str = `Now Playing (autoplay) announcements set to ${playerInfo.informAutoPlaying}!`
        break
      default:
        str = 'Specify option to toggle!'
        return new Response(msg, str)
    }
    return new Response(msg, str)
  }
)
