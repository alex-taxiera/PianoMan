const fs = require('fs')
const h5 = require('../readHDF5')
const db = require('../modules/database.js')

const path = process.argv[2]
const max = parseInt(process.argv[3]) || 1
const batch = (max > 1000) ? 1000 : max

let time = Date.now()
let lastSong = ''
let count = 0
let queue = []
let files = []

start(path)

async function start (path) {
  lastSong = await db.lastSong()
  console.log(lastSong)
  await stats(path)
  trimFiles()
  if (files.length > 0) {
    read()
  } else {
    process.exit()
  }
}

async function stats (path) {
  let stat = fs.statSync(path)
  if (stat.isDirectory()) {
    await handleDirectory(path)
  } else if (stat.isFile() && path.endsWith('h5')) {
    files.push(path)
  }
}

function trimFiles () {
  for (let i = 0; i < files.length; i++) {
    if (files[i].includes(lastSong)) {
      files = files.filter((val, j) => j > i)
    }
  }
  files = files.filter((val, i) => i < max)
}

async function read () {
  while (files.length > 0) {
    await readData(files.splice(0, 1))
  }
  if (queue.length > 0) {
    await handleQueue()
  }
}

async function handleDirectory (dir) {
  let contents = fs.readdirSync(dir)
  for (let entry of contents) {
    await stats(`${dir}/${entry}`)
  }
}

async function handleQueue () {
  await Promise.all(queue.map(db.insert)).then(() => { if (files.length <= 0) process.exit() })
}

async function readData (path) {
  let data = []
  let track = h5(path)
  let { metadata, artist, song } = makeObjects(track)
  console.log(track.track_id, ++count, Date.now() - time)
  data.push(
    { table: 'metadata', data: metadata },
    { table: 'artists', data: artist },
    { table: 'songs', data: song }
  )
  queue = queue.concat(data)
  if (queue.length === batch * 3) { await handleQueue(); queue = [] }
}

function makeObjects (track) {
  return {
    metadata: {
      track_id: track.track_id,
      duration: track.duration,
      hotttnesss: track.song_hotttnesss,
      danceability: track.danceability,
      energy: track.energy,
      loudness: track.loudness,
      key: track.key,
      mode: track.mode,
      tempo: track.tempo,
      time_signature: track.time_signature,
      analysis_sample_rate: track.analysis_sample_rate,
      end_of_fade_in: track.end_of_fade_in,
      start_of_fade_out: track.start_of_fade_out,
      sections_start: JSON.stringify(track.sections_start),
      segments_start: JSON.stringify(track.segments_start),
      segments_loudness_start: JSON.stringify(track.segments_loudness_start),
      segments_loudness_max_time: JSON.stringify(track.segments_loudness_max_time),
      segments_loudness_max: JSON.stringify(track.segments_loudness_max),
      beats_start: JSON.stringify(track.beats_start),
      tatums_start: JSON.stringify(track.tatums_start),
      bars_start: JSON.stringify(track.bars_start),
      segments_timbre: JSON.stringify(track.segments_timbre),
      segments_pitches: JSON.stringify(track.segments_pitches)
    },
    artist: {
      artist_id: track.artist_id,
      name: track.artist_name,
      hotttnesss: track.artist_hotttnesss,
      location: track.artist_location,
      longitude: track.artist_longitude,
      latitude: track.artist_latitude,
      familiarity: track.artist_familiarity,
      mbtags: JSON.stringify(track.artist_mbtags),
      mbtags_count: JSON.stringify(track.artist_mbtags_count),
      terms: JSON.stringify(track.artist_terms),
      terms_freq: JSON.stringify(track.artist_terms_freq),
      terms_weight: JSON.stringify(track.artist_terms_weight),
      similar_artists: JSON.stringify(track.similar_artists)
    },
    song: {
      song_id: track.song_id,
      title: track.title,
      album: track.release,
      year: track.year,
      artist_id: track.artist_id,
      track_id: track.track_id
    }
  }
}
