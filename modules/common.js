const moment = require('moment')
const colors = require('colors')

module.exports = {
  log: function (str, color, err) {
    if (typeof str !== 'string') {
      str = str.toString()
    }

    console.log(colors.gray(`${moment().format('MM/DD HH:mm:ss')}`) + ' | ' +
    colors[color](`BZZT ${str.toUpperCase()} BZZT`))
    if (err) {
      console.log(colors.red(err))
    }
  },
  findChannel: function (type, guildId) {
    let botChannels = require('../PianoMan.js').Channels
    if (type === 'text') {
      let channels = botChannels.textForGuild(guildId)
      .filter((channel) => {
        if (module.exports.can(['SEND_MESSAGES', 'READ_MESSAGES'], channel)) { return channel }
      })
      if (channels[0]) {
        return { id: channels[0].id, name: channels[0].name }
      }
    } else if (type === 'voice') {
      let channels = botChannels.voiceForGuild(guildId)
      .filter((channel) => {
        if (module.exports.can(['SPEAK', 'CONNECT'], channel)) { return channel }
      })

      if (channels[0]) {
        channels[0].join()
        return { id: channels[0].id, name: channels[0].name }
      }
    }
    return null
  },
  getTextChannel: function (id) {
    let text = require('../PianoMan.js').Channels.get(require('./database').getGuildInfo(id).text.id)
    if (!module.exports.can(['SEND_MESSAGES', 'READ_MESSAGES'], text)) {
      return module.exports.findChannel('text', id)
    } else {
      return text
    }
  },
  messageHandler: function (response) {
    if (response && response.message) {
      if (typeof response.message === 'string') {
        let id = response.message
        let textChannel = module.exports.getTextChannel(id)
        if (textChannel) {
          textChannel.sendMessage(response.content)
          .then((m) => {
            setTimeout(() => { m.delete() }, response.delay)
          })
        }
      } else {
        let id = response.message.guild.id
        if (!response.embed) {
          response.message.reply(response.content)
          .then((m) => {
            setTimeout(() => { m.delete() }, response.delay)
          })
          .catch(() => {
            let textChannel = module.exports.getTextChannel(id)
            if (textChannel) {
              textChannel.sendMessage(response.content)
              .then((m) => {
                setTimeout(() => { m.delete() }, response.delay)
              })
            }
          })
        } else {
          response.message.channel.sendMessage(response.content, false, response.embed)
          .then((m) => {
            setTimeout(() => { m.delete() }, response.delay)
          })
          .catch(() => {
            let textChannel = module.exports.getTextChannel(id)
            if (textChannel) {
              textChannel.sendMessage(response.content, false, response.embed)
              .then((m) => {
                setTimeout(() => { m.delete() }, response.delay)
              })
            }
          })
        }
      }
    }
  },
  can: function (needs, context) {
    if (!context) {
      return false
    }

    return needs.every((need) => {
      let permission = require('../PianoMan.js').User.permissionsFor(context)
      if (context.isGuildText) {
        return permission.Text[need]
      } else if (context.isGuildVoice) {
        return permission.Voice[need]
      }
    })
  },
  dmWarn: function (id, text, voice) {
    let guild = require('../PianoMan.js').Guilds.get(id)
    let owner = guild.members.find(m => m.id === guild.owner_id)
    let str = ''

    if (!text && !voice) {
      str = 'There are no text channels or voice channels that are suitable for me! ' +
      'I would like sending and reading permissions in a text channel and connect ' +
      'and speak permissions in a voice channel'
    } else if (!text) {
      str = 'There are no text channels that are suitable for me! ' +
      'I would like sending and reading permissions'
    } else if (!voice) {
      str = 'There are no voice channels that are suitable for me! ' +
      'I would like speaking and connecting permissions'
    }
    owner.openDM()
    .then(dm => {
      dm.sendMessage(str)
      .catch((e) => {
        module.exports.log('cannot send dm', e)
      })
    })
    .catch((e) => {
      module.exports.log('cannot open dm', e)
    })
  }
}
