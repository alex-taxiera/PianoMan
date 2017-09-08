const music = require('../music.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'queue',
  'Displays the queue',
  [],
  'Anyone',
  function (msg) {
    let str = music.getQueue(msg.guild.id)
    return new Response(msg, str)
  }
)
