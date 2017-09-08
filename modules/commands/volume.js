const music = require('../music.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'volume',
  'Set music volume.',
  ['number (1-200)'],
  'Anyone in Voice',
  function (msg, params) {
    let str = music.volume(msg.guild.id, params[0])

    return new Response(msg, str)
  }
)
