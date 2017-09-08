const music = require('../music.js')
const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'clearqueue',
  'Removes all songs from the queue',
  [],
  'VIP',
  function (msg) {
    let str = ''
    music.clearQueue(msg.guild.id)
    str = 'Queue has been cleared!'
    return new Response(msg, str)
  }
)
