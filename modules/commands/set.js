const func = require('../common.js')
const db = require('../database.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'set',
  'Set default voice or text channel',
  [`"voice|text|vip"`, 'channel name'],
  'VIP',
  function (msg, params) {
    const bot = require('../../PianoMan.js')
    let id = msg.guild.id
    let guildInfo = db.getGuildInfo(id)
    let str = ''

    let option = params[0]
    params.splice(0, 1)
    let fullParam = params.join(' ')
    let channel = {}

    switch (option) {
      case 'vip':
        let role = msg.guild.roles.find(r => r.name === fullParam)
        if (role) {
          if (role !== guildInfo.vip) {
            guildInfo.vip = role.id
            str = 'VIP set!'
          } else {
            str = 'VIP is already set to that role!'
          }
        } else {
          str = `Could not find role "${fullParam}"`
        }
        break
      case 'text':
        channel = bot.Channels.textForGuild(id)
        .find((channel) => channel.name === fullParam)
        if (channel) {
          if (guildInfo.text.id !== channel.id) {
            if (func.can(['READ_MESSAGES'], channel)) {
              if (func.can(['SEND_MESSAGES'], channel)) {
                guildInfo.text = {id: channel.id, name: channel.name}
                str = 'Default set!'
              } else {
                str = 'Cannot send messages there!'
              }
            } else {
              str = 'Cannot read messages there!'
            }
          } else {
            str = 'Already default channel!'
          }
        } else {
          str = `Could not find ${fullParam} channel!`
        }
        break
      case 'voice':
        channel = bot.Channels.voiceForGuild(id)
        .find((channel) => channel.name === fullParam)
        if (channel) {
          if (guildInfo.text.id !== channel.id) {
            if (func.can(['CONNECT'], channel)) {
              if (func.can(['SPEAK'], channel)) {
                guildInfo.voice = {id: channel.id, name: channel.name}
                channel.join()
                str = 'Default set!'
              } else {
                str = 'Cannot speak in that channel!'
              }
            } else {
              str = 'Cannot connect to that channel!'
            }
          } else {
            str = 'Already default channel!'
          }
        } else {
          str = `Could not find ${fullParam} channel!`
        }
        break
      default:
        str = 'Specify text or voice with first param!'
        return new Response(msg, str)
    }
    return new Response(msg, str)
  }
)
