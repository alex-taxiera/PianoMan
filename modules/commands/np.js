const music = require('../music.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'np',
  'Displays the current song',
  [],
  'Anyone',
  function (msg) {
    let str = 'Now playing: '
    str += music.np(msg.guild.id)
    return new Response(msg, str)
  }
)
