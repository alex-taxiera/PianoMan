const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')

module.exports = new Command(
  'help',
  'Displays this message, duh!',
  [],
  'Anyone',
  function (msg, commands) {
    let str = 'Available commands:'

    for (let key in commands) {
      if (!commands.hasOwnProperty(key)) {
        continue
      }
      let c = commands[key]
      str += `\n*${c.name} (${c.rank})`

      for (let j = 0; j < c.parameters.length; j++) {
        str += ` <${c.parameters[j]}>`
      }
      str += `: ${c.description}`
    }

    msg.member.openDM()
    .then(dm => {
      dm.sendMessage(str)
    })

    let retStr = 'Command list sent!'
    return new Response(msg, retStr)
  }
)
