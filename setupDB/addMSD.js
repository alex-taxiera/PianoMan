const fs = require('fs')
const h5 = require('../readHDF5')
const path = process.argv[2]
const max = parseInt(process.argv[3]) || 1
const db = require('../modules/database.js')
let limiter = 0
let count = 0
let time = Date.now()

let queue = []
stats(path)

async function stats (path) {
  let stat = fs.statSync(path)
  if (stat.isDirectory()) {
    await handleDirectory(path)
  } else if (stat.isFile() && path.endsWith('h5')) {
    let songs = await db.pluck('songs', 'track_id')
    if (limiter < max) {
      if (!songs.includes(path.slice(-21, -3))) {
        limiter++
        await readToQueue(path)
      }
    }
  }
}

async function handleDirectory (dir) {
  let contents = fs.readdirSync(dir)
  for (let entry of contents) {
    await stats(`${dir}/${entry}`)
  }
}

async function handleQueue () {
  Promise.all(queue.map(db.insert)).then(process.exit)
}

async function readToQueue (path) {
  let data = []
  let track = h5(path)
  for (let key in track) {
    if (typeof track[key] === 'string') {
      track[key] = track[key].replace('�', '')
    }
  }
  let { metadata, artist, song } = makeObjects(track)
  console.log(artist.location)
  console.log(track.track_id, ++count, Date.now() - time)
  let meta = await db.pluck('metadata', 'track_id')
  if (!meta.includes(track.track_id)) {
    data.push(['metadata', metadata])
  }
  let artists = await db.pluck('artists', 'artist_id')
  if (!artists.includes(track.artist_id)) {
    data.push(['artists', artist])
  }
  data.push(['songs', song])
  queue.push(data)
  if (queue.length === max) { await handleQueue() }
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
