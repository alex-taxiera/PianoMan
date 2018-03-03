// https://github.com/NathanEpstein/clusters
// We'll be running the algorithm, writing cluster down in DB, and picking random song from same cluster in db
// To implement with live results, we'd add each song played over the course of the day to the db, then when
// Day comes to an end, add them all to the db, assign cluster, recenter, and push new Kmeans to live.

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

//To remove = duration, hotttnesss, danceability, energy, start_of_fade_out,
//end_of_fade_in

// X = key (0-11), sections_start,
// Y = mode (0 or 1), tempo, segments_start, segments_loud

function normalizeFloat(value, max, min) {
  return ((value - min) / (max - min))
}

async function tempoMaxFind() {
  return md('metadata').max('tempo').then((maxboi) => {
    tempoMax = maxboi[0]['max(`tempo`)']
    return tempoMax
  })
}

async function tempoMinFind() {
  return md('metadata').min('tempo').then((minboi) => {
    let tempoMin = minboi[0]['min(`tempo`)']
    return tempoMin
  })
}
function loudMaxFind() {
  md('metadata').max('loudness').then((maxboi) => {
    let tempoMax = maxboi[0]['max(`loudness`)']
    return loudMax
  })
}

function loudMinFind() {
  md('metadata').min('loudness').then((minboi) => {
    let loudMin = minboi[0]['min(`loudness`)']
    return loudMin
  })
}

let graphArray = new Array()

md('metadata').select('*').then(async (rows) => {
  let arraylen = rows.length
  for (let i = 0; i < arraylen; i++) {
    let song = rows[i]
    let pairX = 0
    let pairY = 0
    let tempoMax = await tempoMaxFind()
    let tempoMin = await tempoMinFind()

    pairX = (normalizeFloat(song.tempo, tempoMax, tempoMin)) //+ normalizeFloat(song.loudness)) / 2
    pairY = normalizeFloat(song.key, 11, 0) //Key is always 1-12

    graphArray.push([pairX, pairY])
    //let sections = JSON.parse(song.sections_start)
    //let sectionavg = sections.reduce((a,b) => a + b, 0) / song.sections_start.length
  }

  var cluster = require('k-means');

  cluster (graphArray, { clusters: 15, iterations: 10 }, (results) => {
    console.log(results)
  })

})

// md('metadata').select('*').where(`track_id=${song1.track_id}`).then((newrows) => {
// })
