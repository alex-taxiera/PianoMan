const music = require('../music.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'play',
  'Resumes paused/stopped playback',
  [],
  'Anyone in Voice',
  function (msg) {
    let str = music.play(msg.guild.id)

    return new Response(msg, str)
  }
)
