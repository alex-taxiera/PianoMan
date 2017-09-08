const music = require('../music.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'skip',
  'Skips the current song',
  [],
  'Anyone in Voice',
  function (msg) {
    let str = music.skip(msg.guild.id)
    return new Response(msg, str)
  }
)
