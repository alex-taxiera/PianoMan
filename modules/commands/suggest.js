const Command = require('../classes/Command.js')
const Response = require('../classes/Response.js')
const util = require('util')
const moment = require('moment')
const wikijs = require('wikijs').default
const math = require('mathjs')
const db = require('../database.js')
const ytsr = require('ytsr')

const search = util.promisify(ytsr.search)

module.exports = new Command(
  'suggest',
  'Generates five suggestions based on your listening history',
  [],
  'Anyone',
  async function (msg) {
    // get data on message.member.id
    // call algorithm on user database
    // simulated user data
    const info = [
      { id: '434507972379672587', recent_songs: ['SOYEGAB12A8C142FDE'] },
      { id: '137371223800676352', recent_songs: ['SONQHCW12AF72A574E'] }
    ]
    const userData = info.find((user) => user.id === msg.author.id)
    let songs = await returnSuggest(userData)
    let suggestions = []
    for (let i = 0; i < songs.length; i++) {
      let query = songs[i].title + ' ' + songs[i].album + ' ' + songs[i].artist
      let results = (await search(query, { limit: 5 }))
      results = results.items.filter((v) => v.type === 'video')
      let sLink = results[0].link
      console.log(sLink)
      suggestions.push({ name: songs[i].title, artist: songs[i].artist, sLink, aLink: await wiki(songs[i].artist) })
    }
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
    const responseEmbed = await msg.reply('Respond with a number to select a song!', false, embed)
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
          responseEmbed.delete().catch(console.error)
          require('../common.js').messageHandler(require('./request.js').execute(msg, [suggestions[response - 1].sLink]))
          clearInterval(loop)
        }
      }
      if (count > 30) {
        responseEmbed.delete().catch(console.error)
        clearInterval(loop)
      }
    }, 1000)
    // while
    // return new Response(msg, '', 25000, embed)
  }
)

async function wiki (term) {
  try {
    console.log((await wikijs().page(term)).raw.fullurl)
    return (await wikijs().page(term)).raw.fullurl
  } catch (e) {
    return ''
  }
}

async function returnSuggest (data) {
  // Gather location # from songs table for each recently played.
  let temp2 = data.recent_songs.map((val) => { return { table: 'songs', limit: 100, columns: ['location'], where: {song_id: val} } })
  let rows2 = await Promise.all(temp2.map(db.select))

  // Parse locations into numbers
  let locations = rows2.map((val) => { return JSON.parse(val[0].location) })
  let avgloc = [0, 0, 0, 0, 0]

  let euclidean = require('compute-euclidean-distance')

  // Add each location value together
  for (let j = 0; j < avgloc.length; j++) {
    for (let i = 0; locations.length > i; i++) {
      avgloc[j] += locations[i][j]
    }
  }
  // Divide summated location values to find average
  for (let j = 0; j < avgloc.length; j++) {
    avgloc[j] /= locations.length
  }

  let clusterlocs = await db.select({ table: 'clusters', columns: ['cluster_id', 'center'], limit: 20 })
  clusterlocs = clusterlocs.map((val) => { return { cluster_id: val.cluster_id, center: JSON.parse(val.center) } })

  clusterlocs.map((cluster) => {
    cluster.center = euclidean(cluster.center, avgloc)
  })

  // I made this - Damon
  let closest = clusterlocs.sort((a, b) => {
    if (a.center < b.center) return -1
    else if (b.center < a.center) return 1
    return 0
  })[0]

  console.log(clusterlocs)
  console.log(closest)

  // Array of tuples [cluster, location]
  let temp = data.recent_songs.map((val) => { return { table: 'songs', limit: 100, columns: ['song_id', 'cluster', 'location'], where: { song_id: val } } })
  let rows = await Promise.all(temp.map(db.select))
  let values = []
  for (let i = 0; rows.length > i; i++) {
    values.push(rows[i][0].cluster)
  }
  let suggests = await db.select({ table: 'songs', columns: ['artist_id', 'title', 'album'], where: { cluster: closest.cluster_id }, limit: 5 })
  for (let i = 0; i < suggests.length; i++) {
    suggests[i].artist = (await db.select({ table: 'artists', columns: ['name'], where: { artist_id: suggests[i].artist_id } }))[0].name
  }
  return suggests
}
