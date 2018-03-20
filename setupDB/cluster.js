// We'll be running the algorithm, writing cluster down in DB, and picking random song from same cluster in db
// To implement with live results, we'd add each song played over the course of the day to the db, then when
// Day comes to an end, add them all to the db, assign cluster, recenter, and push new Kmeans to live.
const db = require('../modules/database.js')
const fs = require('fs')
// To remove = duration, hotttnesss, danceability, energy, start_of_fade_out,
// end_of_fade_in

// X = key (0-11), sections_start,
// Y = mode (0 or 1), tempo, segments_start, segments_loud

start()

async function start () {
  const limit = 2000

  const table = 'metadata'
  let columns = ['tempo', 'key']
  const minMax = await db.minMax({ table, columns })
  columns.push('track_id')

  let pointObject = {}
  let graphArray = []
  const count = await db.count('metadata')

  for (let offset = 0; offset < count; offset += limit) {
    let metadata = await db.select({ table, columns, offset, limit })
    console.log('1', metadata)
    for (let i = 0; i < metadata.length; i++) {
      let location = []
      for (let attr in metadata[i]) {
        if (attr === 'track_id') continue
        location.push(normalizeFloat(metadata[i][attr], minMax[attr]))
      }
      pointObject[metadata[i].track_id] = { location: JSON.stringify(location) }
      graphArray.push(location)
      // let sections = JSON.parse(song.sections_start)
      // let sectionavg = sections.reduce((a,b) => a + b, 0) / song.sections_start.length
    }
  }

  fs.writeFileSync('data.json', JSON.stringify(graphArray, null, 2))
  console.log('data written')
  fs.writeFileSync('dict.json', JSON.stringify(pointObject, null, 2))
  console.log('dict written')
  // let graphArray = require('./data.json')
  // let pointObject = require('./dict.json')

  let { labels, centers } = JSON.parse((require('child_process').spawnSync('py', [require('path').join(__dirname, '/cluster.py')])).stdout)
  let labelObject = {}
  for (let i = 0; i < graphArray.length; i++) {
    labelObject[JSON.stringify(graphArray[i])] = labels[i]
  }

  let updates = []
  for (let track_id in pointObject) {
    let location = pointObject[track_id].location
    // {table, condition, data}
    updates.push({ table: 'songs', condition: { track_id }, data: { location, cluster: labelObject[location] } })
  }

  fs.writeFileSync('update.json', JSON.stringify(updates, null, 2))
  console.log('update written')
  // let updates = require('./update.json')

  let clusters = []
  for (let i = 0; i < centers.length; i++) {
    clusters[i] = { cluster_id: i, center: JSON.stringify(centers[i]) }
  }

  fs.writeFileSync('clusters.json', JSON.stringify(clusters, null, 2))
  console.log('clusters written')
  // let clusters = require('./clusters.json')

  Promise.all(clusters.map((val) => [['clusters', val]]).map(db.insert)).then(async () => {
    while (updates.length > 0) {
      console.log(updates.length)
      let tmp = []
      for (let i = 0; i < limit && updates.length > 0; i++) {
        tmp.push(updates.pop())
      }
      await Promise.all(tmp.map(db.update)).then(() => { if (updates.length < 1) process.exit() })
    }
  })
}

function normalizeFloat (value, { max, min }) {
  return ((value - min) / (max - min))
}
