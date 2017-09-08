const music = require('../music.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'remove',
  'Removes a song from the queue',
  ["Request index or 'last'"],
  'VIP',
  function (msg, params) {
    let str = music.remove(msg.guild.id, params[0])
    return new Response(msg, str)
  }
)
