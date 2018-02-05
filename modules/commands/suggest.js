const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')
const moment = require('moment')

module.exports = new Command(
  'suggest',
  'Generates five suggestions based on your listening history',
  [],
  'Anyone',
  function (msg) {
    // get data on message.member.id
    // call algorithm on user database
    let suggestions = [
      {name: 'All Star', sLink: 'https://www.youtube.com/watch?v=L_jWHffIx5E', artist: 'Smash Mouth', aLink: 'https://en.wikipedia.org/wiki/Smash_Mouth'},
      {name: 'Photograph', sLink: 'https://www.youtube.com/watch?v=BB0DU4DoPP4', artist: 'Nickelback', aLink: 'https://en.wikipedia.org/wiki/Nickelback'},
      {name: 'Never Gonna Give You Up', sLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', artist: 'Rick Astley', aLink: 'https://en.wikipedia.org/wiki/Rick_Astley'},
      {name: 'Shooting Stars', sLink: 'https://www.youtube.com/watch?v=feA64wXhbjo', artist: 'Bag Raiders', aLink: 'https://en.wikipedia.org/wiki/Bag_Raiders'},
      {name: "Running in the 90's", sLink: 'https://www.youtube.com/watch?v=BJ0xBCwkg3E', artist: 'Maurizio De Jorio', aLink: 'https://en.wikipedia.org/wiki/Maurizio_De_Jorio'}
    ]
    // format suggestions
    let embed = {
      description: ':musical_note: [**Suggestions**](https://github.com/alex-taxiera/PianoMan)',
      thumbnail: {url: 'https://github.com/alex-taxiera/PianoMan/blob/master/data/PianoMan.png?raw=true'},
      timestamp: moment(),
      color: 0x00ff00,
      footer: {
        icon_url: 'https://github.com/alex-taxiera/PianoMan/blob/master/data/PianoMan.png?raw=true',
        text: 'PianoMan'
      }
    }

    for (let i = 0; i < suggestions.length; i++) {
      let song = suggestions[i]
      embed.description += `\n\n#${i + 1} [${song.name}](${song.sLink})\nBy: [${song.artist}](${song.aLink})`
    }
    msg.reply('Respond with a number to select a song!', false, embed)
    let count = 0
    let loop = setInterval(function () {
      count++
      let last = msg.channel.messages.filter((m) => m.author.id === msg.author.id)
      last = last[last.length - 1]
      if (last.id !== msg.id) {
        let response = last.content
        if (isNaN(response) || response < 1 || response > suggestions.length + 1) {
          clearInterval(loop)
        } else {
          require('../common.js').messageHandler(require('./request.js').execute(msg, [suggestions[response - 1].sLink]))
          clearInterval(loop)
        }
      }
      if (count > 30) {
        clearInterval(loop)
      }
    }, 1000)
    // while
    // return new Response(msg, '', 25000, embed)
  }
)
