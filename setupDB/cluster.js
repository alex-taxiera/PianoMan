// https://github.com/NathanEpstein/clusters
// We'll be running the algorithm, writing cluster down in DB, and picking random song from same cluster in db
// To implement with live results, we'd add each song played over the course of the day to the db, then when
// Day comes to an end, add them all to the db, assign cluster, recenter, and push new Kmeans to live.
const db = require('../modules/database.js')
var md = require('knex')({
  client: 'mysql',          // Variable connection name, match to cloud
  connection: {
    user: 'root',
    password: '123456',
    host: 'localhost',
    database: 'tester'
  },
  pool: { min: 1, max: 100 }
})

const limit = 2000
// To remove = duration, hotttnesss, danceability, energy, start_of_fade_out,
// end_of_fade_in

// X = key (0-11), sections_start,
// Y = mode (0 or 1), tempo, segments_start, segments_loud

function normalizeFloat (value, max, min) {
  return ((value - min) / (max - min))
}

async function tempoMaxFind () {
  return md('metadata').max('tempo').then((maxboi) => {
    let tempoMax = maxboi[0]['max(`tempo`)']
    return tempoMax
  })
}

async function tempoMinFind () {
  return md('metadata').min('tempo').then((minboi) => {
    let tempoMin = minboi[0]['min(`tempo`)']
    return tempoMin
  })
}
// function loudMaxFind () {
//   md('metadata').max('loudness').then((maxboi) => {
//     let loudMax = maxboi[0]['max(`loudness`)']
//     return loudMax
//   })
// }
//
// function loudMinFind () {
//   md('metadata').min('loudness').then((minboi) => {
//     let loudMin = minboi[0]['min(`loudness`)']
//     return loudMin
//   })
// }

start()

async function start () {
  let pointObject = {}
  let graphArray = []

  let tempoMax = await tempoMaxFind()

  let tempoMin = await tempoMinFind()

  let count = (await md('metadata').count('*').then())[0]['count(*)']
  for (let i = 0; i < count; i += limit) {
    await md('metadata').select('*').offset(i).limit(limit).then(async (rows) => {
      for (let j = 0; j < rows.length; j++) {
        let song = rows[j]
        let pairX = (normalizeFloat(song.tempo, tempoMax, tempoMin)) // + normalizeFloat(song.loudness)) / 2
        let pairY = normalizeFloat(song.key, 11, 0) // Key is always 1-12
        let pair = [pairX, pairY]
        pointObject[JSON.stringify(pair)] = song.track_id
        graphArray.push(pair)
        // let sections = JSON.parse(song.sections_start)
        // let sectionavg = sections.reduce((a,b) => a + b, 0) / song.sections_start.length
      }
    })
  }
  require('fs').writeFileSync('data.json', JSON.stringify(graphArray, null, 2))
  require('fs').writeFileSync('dict.json', JSON.stringify(pointObject, null, 2))
  // let graphArray = require('./data.json')
  // let pointObject = require('./dict.json')

  let data = (require('child_process').spawnSync('py', [require('path').join(__dirname, '/cluster.py')])).stdout
  let kmeans = JSON.parse(data)
  for (let i = 0; i < kmeans.labels.length; i++) {
    let cluster = kmeans.labels[i]
    let point = JSON.stringify(graphArray[i])
    let track_id = pointObject[point]
    pointObject[point] = {cluster, track_id}
  }
  let clusters = []
  for (let i = 0; i < kmeans.centers.length; i++) {
    let center = JSON.stringify(kmeans.centers[i])
    let cluster_id = i
    clusters[i] = {cluster_id, center}
  }
  require('fs').writeFileSync('clusters.json', JSON.stringify(clusters, null, 2))
  Promise.all(clusters.map((val) => [['clusters', val]]).map(db.insert)).then(() => {
    // {table, condition, data}
    let updates = []
    for (let point in pointObject) {
      let {cluster, track_id} = pointObject[point]
      updates.push({table: 'songs', condition: {track_id}, data: {cluster, location: point}})
    }
    require('fs').writeFileSync('update.json', JSON.stringify(updates, null, 2))
    Promise.all(updates.map(db.update)).then(process.exit)
  })
}
