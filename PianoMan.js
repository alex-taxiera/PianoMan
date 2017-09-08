const Discordie = require('discordie')
const seedrandom = require('seedrandom')

// project modules
const config = require('./config.json')
const func = require('./modules/common.js')
const music = require('./modules/music.js')
const db = require('./modules/database.js')
const cmd = require('./modules/commands.js')

let bot = new Discordie({ autoReconnect: true })
module.exports = bot

// connect bot
start()

// randomly select a game every 12 hours
setInterval(function () { setGame() }, 43200000) // 43200000

// events
bot.Dispatcher.on('GUILD_ROLE_DELETE', (e) => {
  let guildInfo = db.getGuildInfo(e.guild.id)

  if (e.roleId === guildInfo.vip) {
    guildInfo.vip = null
  }
})

bot.Dispatcher.on('DISCONNECTED', (e) => {
  func.log('disconnected', 'red', `${e.error}\nRECONNECT DELAY: ${e.delay}`)
})

bot.Dispatcher.on('VOICE_CHANNEL_LEAVE', (e) => {
  let id = e.guildId

  if (e.user.id === bot.User.id) {
    func.log(`left channel ${e.channel.name}`, 'yellow')

    if (!e.newChannelId) {
      let voiceChannel = bot.Channels.get(e.channelId)
      voiceChannel.join(voiceChannel).catch((e) => { func.log(null, 'red', e) })
    }
  } else {
    music.checkPlayer(id)
  }
})

bot.Dispatcher.on('VOICE_CHANNEL_JOIN', (e) => {
  setTimeout(() => { music.checkPlayer(e.guildId) }, 100)
})

bot.Dispatcher.on('CHANNEL_CREATE', (e) => {
  let ch = e.channel
  if (!ch.guild) { return }
  let id = ch.guild.id
  let guildInfo = db.getGuildInfo(id)
  let text = guildInfo.text
  let voice = guildInfo.voice

  if (!text || !voice) {
    if (ch.type === 0 && !text &&
    func.can(['SEND_MESSAGES', 'READ_MESSAGES'], ch)) {
      guildInfo.text = { id: ch.id, name: ch.name }
    } else if (ch.type === 2 && !voice &&
    func.can(['SPEAK', 'CONNECT'], ch)) {
      ch.join()
      guildInfo.voice = { id: ch.id, name: ch.name }
    }
  }
})

bot.Dispatcher.on('CHANNEL_DELETE', (e) => {
  db.checkChannels(e.data.guild_id, bot.Channels)
})

bot.Dispatcher.on('CHANNEL_UPDATE', (e) => {
  db.checkChannels(e.channel.guild.id, bot.Channels, e.channel.id)
})

bot.Dispatcher.on('GUILD_CREATE', (e) => {
  func.log(`joined ${e.guild.name} guild`, 'green')
  db.addClient(e.guild, bot.Channels)
})

bot.Dispatcher.on('GUILD_DELETE', (e) => {
  let id = e.guildId
  let name = db.getClient(id).guild.name
  func.log(`left ${name} guild`, 'yellow')

  // TODO remove player map entry
  // music.removePlayer(id) will call destroy
  music.destroy(id)
  db.removeClient(id)
})

bot.Dispatcher.on('GATEWAY_READY', () => {
  func.log('online', 'green')
  setGame()
  db.initialize(bot.Guilds, bot.Channels)
  setTimeout(() => { music.initialize(bot.Guilds) }, 50)
})

bot.Dispatcher.on('MESSAGE_CREATE', (e) => {
  let msg = e.message
  if (msg.member && msg.member.id !== bot.User.id) {
    let text = msg.content
    if (text[0] === '>') {
      cmd.handleCommand(msg, text.substring(1))
    }
  }
})

// helpers
function start () {
  const tok = config.token
  if (tok !== '') {
    bot.connect({ token: tok })
  } else {
    func.log('no token', 'red')
  }
}

function setGame () {
  let rng = seedrandom()
  let games = config.games

  let game = {
    type: 0,
    name: bot.User.gameName
  }
  while (game.name === bot.User.gameName) {
    game.name = games[Math.floor(rng() * games.length)]
  }
  func.log(`playing ${game.name}`, 'cyan')
  bot.User.setGame(game)
}
