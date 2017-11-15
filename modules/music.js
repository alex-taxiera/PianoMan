const ytdl = require('youtube-dl')
const ytpl = require('ytpl')
const ytsr = require('ytsr')
const fs = require('fs')
const seedrandom = require('seedrandom')
const rng = seedrandom()
const func = require('./common.js')
const db = require('./database.js')
const Player = require('./classes/Player.js')
const Response = require('./classes/Response.js')
const data = './data/guilds/'

// TODO move youtube interfacing to youtube.js

let playerMap = new Map()

module.exports = {
  initialize: function (guilds) {
    guilds.forEach((guild) => {
      playerMap.set(guild.id, new Player())
    })
  },
  checkPlayer: function (id, start = false) {
    let voiceMembers = require('../PianoMan.js').User.getVoiceChannel(id).members.length
    let player = playerMap.get(id)
    if (start) {
      if (voiceMembers > 1) {
        playNextSong(id)
      } else {
        player.paused = true
      }
    } else {
      if (player.isPlaying &&
      player.encoder.voiceConnection.channel.members.length === 1 && !player.paused) {
        player.paused = true
        player.encoder.voiceConnection.getEncoderStream().cork()
      } else if (!player.isPlaying && voiceMembers > 1 && !player.paused) {
        playNextSong(id)
      }
    }
  },
  play: function (id) {
    let player = playerMap.get(id)
    let playerInfo = db.getPlayerInfo(id)
    if (!player.isPlaying && player.queue.length === 0) {
      if (playerInfo.autoplay) {
        player.paused = false
        module.exports.autoQueue(id)

        return 'Starting!'
      } else {
        return 'Turn autoplay on, or use search or request to pick a song!'
      }
    } else if (player.paused) {
      player.paused = false

      if (player.isPlaying) {
        player.encoder.voiceConnection.getEncoderStream().uncork()
      }

      return 'Resuming!'
    } else {
      return 'Playback is already running'
    }
  },
  skip: function (id) {
    let player = playerMap.get(id)
    if (player.isPlaying) {
      player.encoder.destroy()

      return 'Skipping...'
    } else {
      return 'There is nothing being played.'
    }
  },
  pause: function (id) {
    let player = playerMap.get(id)
    if (player.paused) {
      return 'Playback is already paused!'
    } else {
      player.paused = true

      if (player.isPlaying) {
        player.encoder.voiceConnection.getEncoderStream().cork()
      }
      return 'Pausing!'
    }
  },
  stop: function (id) {
    let player = playerMap.get(id)

    if (player.isPlaying) {
      player.paused = true
      player.encoder.destroy()
      player.nowPlaying = {}

      return 'Stopping...'
    } else {
      return 'Bot is not playing anything!'
    }
  },
  clearQueue: function (id) {
    let player = playerMap.get(id)
    player.queue = []
  },
  getQueue: function (id) {
    let player = playerMap.get(id)
    if (player.queue.length === 0) {
      return 'the queue is empty.'
    } else {
      let str = ''
      for (let i = 0; i < player.queue.length; i++) {
        // 17 because the "and more" string is 17 characters long
        // the remaining videos in queue can never be more than max queue
        // so compare against max queue to be safe
        if (str.length + 17 + player.queue.length.toString().length +
        player.queue[i].title.length + player.queue[i].user.username.length < 2000) {
          str += `"${player.queue[i].title}" (requested by ${player.queue[i].user.username}) `
        } else {
          str += `\n**...and ${(player.queue.length - i - 1)} more.**`
          break
        }
      }
      return str
    }
  },
  remove: function (id, index) {
    let player = playerMap.get(id)

    if (index === 'last') {
      index = player.queue.length
    }
    index = parseInt(index)

    if (player.queue.length === 0) {
      return 'The queue is empty'
    } else if (isNaN(index)) {
      return `Argument "${index}" is not a valid index.`
    } else if (index < 1 || index > player.queue.length) {
      return `Cannot remove request #${index} from the queue (there are only ${player.queue.length} requests currently)`
    } else {
      let deleted = player.queue.splice(index - 1, 1)
      return `Request "${deleted[0].title}" was removed from the queue.`
    }
  },
  np: function (id) {
    let player = playerMap.get(id)
    if (player.isPlaying) {
      return `"${player.nowPlaying.title}" (requested by ${player.nowPlaying.user.username})`
    } else {
      return 'nothing!'
    }
  },
  autoQueue: function (id) {
    let player = playerMap.get(id)
    let playerInfo = db.getPlayerInfo(id)
    // TODO playlist overhaul
    const playlists = './playlists/'
    const files = fs.readdirSync(playlists)

    // check for playlists
    if (files.length === 0) {
      playerInfo.autoplay = false
      return func.log('no playlists', 'yellow')
    }
    // get a random video
    let tmp = fs.readFileSync(`${playlists}/${files[Math.floor((rng() * files.length))]}`, 'utf-8')
    let autoplaylist = tmp.split('\n')
    let video = autoplaylist[Math.floor(rng() * autoplaylist.length)]
    ytdl.getInfo(video, [], { maxBuffer: Infinity }, (error, info) => {
      if (error) {
        func.log(null, 'red', `${video} ${error}`)
        module.exports.autoQueue(id)
      } else {
        player.queue.push({ title: info.title, link: video, user: require('../PianoMan.js').User })
        playNextSong(id)
      }
    })
  },
  addToQueue: function (video, msg, mute = false, done = false) {
    ytdl.getInfo(video, [], {maxBuffer: Infinity}, (error, info) => {
      let str = ''
      let id = msg.guild.id
      let player = playerMap.get(id)

      if (done) {
        str = 'Playlist is queued.'
      } else if (error) {
        func.log(null, 'red', `${video}: ${error}`)
        str = `The requested video (${video}) does not exist or cannot be played.`
      } else {
        player.queue.push({ title: info.title, link: video, user: msg.member })

        if (!mute) {
          str = `"${info.title}" has been added to the queue.`
        }

        if (!player.isPlaying && player.queue.length === 1) {
          player.paused = false
          playNextSong(id)
        }
      }
      func.messageHandler(new Response(msg, str))
    })
  },
  volume: function (id, vol) {
    if (vol / 2 > 0 && vol / 2 <= 100) {
      let player = playerMap.get(id)
      let playerInfo = db.getPlayerInfo(id)
      if (vol / 2 === playerInfo.volume) {
        return 'Volume is already at that level!'
      } else {
        playerInfo.volume = vol

        if (player.isPlaying) {
          player.encoder.voiceConnection.getEncoder().setVolume((vol / 2))
        }
        return 'Volume set!'
      }
    } else {
      return 'Invalid volume level!'
    }
  },
  searchVideo: function (msg, query) {
    ytsr.search(query, { limit: 1 }, function (err, data) {
      if (err) { throw err }

      if (data.items[0].type === 'playlist') {
        return module.exports.queuePlaylist(data.items[0].link, msg)
      } else if (data.items[0].type === 'video') {
        return module.exports.addToQueue(data.items[0].link, msg)
      }
    })
  },
  queuePlaylist: function (playlistId, msg) {
    let done = false

    ytpl(playlistId, (err, playlist) => {
      if (err) { throw err }

      for (let i = 0; i < playlist.items.length; i++) {
        if (i === playlist.items.length - 1) {
          done = true
        }
        module.exports.addToQueue(playlist.items[i].url_simple, msg, true, done)
      }

      let str = `${playlist.title} is being queued.`
      return func.messageHandler(new Response(msg, str))
    })
  },
  destroy: function (id) {
    let player = playerMap.get(id)
    if (player.isPlaying) {
      player.encoder.destroy()
    }
  }
}

function playNextSong (id, msg) {
  let player = playerMap.get(id)
  let playerInfo = db.getPlayerInfo(id)
  let str = ''

  if (player.queue.length === 0) {
    if (playerInfo.autoplay) {
      return module.exports.autoQueue(id)
    } else if (msg) {
      str = 'Nothing in the queue!'
    }
  } else {
    player.isPlaying = true

    let title = player.queue[0].title
    let user = player.queue[0].user
    player.nowPlaying = {title: title, user: user}

    const mp3 = `${data}${id}.mp3`

    let videoLink = player.queue[0].link
    let video = ytdl(videoLink, ['--format=bestaudio/worstaudio', '--no-playlist'], {maxBuffer: Infinity})
    video.pipe(fs.createWriteStream(mp3))

    video.once('end', () => {
      if ((playerInfo.informNowPlaying && playerInfo.informAutoPlaying) ||
      (playerInfo.informNowPlaying && user.id !== require('../PianoMan.js').User.id)) {
        str = `Now playing: "${title}" (requested by ${user.username})`
        func.messageHandler(new Response(id, str, 10000))
      }

      let info = require('../PianoMan.js').VoiceConnections.getForGuild(id)
      player.encoder = info.voiceConnection
      .createExternalEncoder({
        type: 'ffmpeg',
        source: mp3,
        format: 'pcm'
      })

      player.encoder.play()
      player.encoder.voiceConnection.getEncoder().setVolume(playerInfo.volume / 2)

      if (player.encoder.voiceConnection.channel.members.length === 1) {
        player.paused = true
        player.encoder.voiceConnection.getEncoderStream().cork()
      }

      player.encoder.once('end', () => {
        player.isPlaying = false
        if (!player.paused && player.queue.length !== 0) {
          playNextSong(id)
        } else if (!player.paused && playerInfo.autoplay) {
          module.exports.autoQueue(id)
        }
      })
    })
    player.queue.splice(0, 1)
  }
  func.messageHandler(new Response(msg, str))
}
