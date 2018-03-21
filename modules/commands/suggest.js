const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')
const moment = require('moment')
const wiki = requre('wiki').default
const db = require('../database.js')

module.exports = new Command(
  'suggest',
  'Generates five suggestions based on your listening history',
  [],
  'Anyone',
  function (msg) {
    // get data on message.member.id
    // call algorithm on user database
    // simulated user data
    let info = { id: 'abc', recent_songs: ['SOHXFBA12A8C13D637', 'SOLGHDZ12AB0183B11', 'SOLJCCO12A6701F987', 'SOMZZON12A6701D3B9', 'SONHOTT12A8C13493C']}
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

async function wiki (term) {
  return (await wiki().page(term)).raw.fullurl
}

async function returnSuggest (data) {
  // Array of tuples [cluster, location]
  let temp = data.recent_songs.map((val) => { return { table: 'songs', columns: ['song_id', 'cluster', 'location'], where: { song_id: val } } })
  let rows = await Promise.all(temp.map(db.select))
  let values = []
  for (let i = 0; rows.length > i; i++) {
    values.push(rows[i][0].cluster)
  }
  let mode = math.mode(values)

  let suggests = await db.select({ table: 'songs', columns: ['artist_id', 'title', 'album'], where: { cluster: mode }, limit: 5 })
  for (let i = 0; i < suggests.length; i++) {
    suggests[i].artist = (await db.select({ table: 'artists', columns: ['name'], where: { artist_id: suggests[i].artist_id } }))[0].name
  }
  return suggests
}
