const music = require('../music.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'stop',
  'Delete current song and prevent further playback',
  [],
  'Anyone in Voice',
  function (msg) {
    let str = music.stop(msg.guild.id)
    return new Response(msg, str)
  }
)
