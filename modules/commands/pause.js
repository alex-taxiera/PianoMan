const music = require('../music.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'pause',
  'Pauses your shit',
  [],
  'Anyone in Voice',
  function (msg) {
    let str = music.pause(msg.guild.id)

    return new Response(msg, str)
  }
)
