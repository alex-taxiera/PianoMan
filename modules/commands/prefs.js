const db = require('../database.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')
const moment = require('moment')

module.exports = new Command(
  'prefs',
  'Display current bot preferences',
  [],
  'VIP',
  function (msg) {
    let id = msg.guild.id
    let guildInfo = db.getGuildInfo(id)
    let playerInfo = db.getPlayerInfo(id)
    let guild = require('../../PianoMan.js').Guilds.get(id)
    let vipRole = getCleanVipRole(guildInfo, guild)

    let embed = {
      description: ':heartbeat: [**Preferences**](https://github.com/alex-taxiera/PianoMan)',
      thumbnail: {url: 'https://github.com/alex-taxiera/PianoMan/blob/master/data/PianoMan.png?raw=true'},
      timestamp: moment(),
      color: 0x3498db,
      footer: {
        icon_url: 'https://github.com/alex-taxiera/PianoMan/blob/master/data/PianoMan.png?raw=true',
        text: 'PianoMan'
      },
      fields: [
        {name: 'Default Text Channel', value: guildInfo.text.name},
        {name: 'Default Voice Channel', value: guildInfo.voice.name},
        {name: 'VIP Role', value: vipRole},
        {name: 'Announce Now Playing', value: playerInfo.informNowPlaying, inline: true},
        {name: 'Announce Autoplay', value: playerInfo.informAutoPlaying, inline: true},
        {name: 'Autoplay', value: playerInfo.autoplay, inline: true},
        {name: 'Music Volume', value: `${playerInfo.volume}`, inline: true}
      ]
    }
    return new Response(msg, '', 25000, embed)
  }
)

function getCleanVipRole (guildInfo, guild) {
  if (guildInfo.vip) {
    return guild.roles.find(r => r.id === guildInfo.vip).name
  } else {
    return 'None'
  }
}
