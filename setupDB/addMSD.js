const fs = require('fs')
const h5 = require('../readHDF5')
const path = process.argv[2]
let start = true
let queue = []
let count = 0

var md = require('knex')({
  client: 'mysql',          // Variable connection name, match to cloud
  connection: {
    user: '',
    password: '',
    host: 'localhost',
    database: 'test'
  }
})

stats(path)

async function stats (path) {
  // console.log(path)
  fs.stat(path, (err, stat) => {
    if (err) {
      console.error('bad path')
    } else if (stat.isDirectory()) {
      handleDirectory(path)
    } else if (stat.isFile()) {
      handleFile(path)
    }
  })
}

async function handleFile (file) {
  if (file.endsWith('h5')) {
    queue.push(file)
    if (queue.length === 8 && start) {
      start = false
      handleQueue()
    }
  } else {
    console.error('not an h5')
  }
}

async function handleDirectory (dir) {
  fs.readdir(dir, (err, contents) => {
    if (err) {
      console.error(err)
    } else {
      for (let entry of contents) {
        stats(`${dir}/${entry}`)
      }
    }
  })
}

async function handleQueue () {
  while (queue.length > 0 && count < 8) {
    count++
    h5(queue.splice(0, 1)[0], handleData)
  }
}

async function handleData (stdout) {
  count--
  let song = JSON.parse(stdout)
  let obj = {
    id: song.id,
    title: song.metadata.song.title,
    year: song.musicbrainz.year,
    artist_id: song.metadata.song.artist_id,
    artist_name: song.metadata.song.artist,
    similar_artists: JSON.stringify(song.metadata.similar_artists),
    artist_terms: JSON.stringify(song.metadata.artist_terms),
    artist_terms_freq: JSON.stringify(song.metadata.artist_terms_freq),
    artist_terms_weight: JSON.stringify(song.metadata.artist_terms_weight),
    sections_start: JSON.stringify(song.analysis.sections_start),
    segments_start: JSON.stringify(song.analysis.segments_start),
    segments_loudness_start: JSON.stringify(song.analysis.segments_loudness_start),
    segments_loudness_max_time: JSON.stringify(song.analysis.segments_loudness_max_time),
    segments_loudness_max: JSON.stringify(song.analysis.segments_loudness_max),
    beats_start: JSON.stringify(song.analysis.beats_start),
    tatums_start: JSON.stringify(song.analysis.tatums_start),
    bars_start: JSON.stringify(song.analysis.bar_start)
  }

  md('msd').insert(obj).then()

  if (count === 7) {
    handleQueue()
  }
}
