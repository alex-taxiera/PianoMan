const db = require('../modules/database.js')

crunch()

async function crunch () {
  const limit = 2000

  const table = 'metadata'
  let columns = ['segments_timbre', 'segments_pitches', 'track_id']
  const count = await db.count(table)

  for (let offset = 0; offset < count; offset += limit) {
    let updates = []
    let pitch = 0
    let timbre = 0
    let metadata = await db.select({ table, columns, offset, limit })
    for (let i = 0; i < metadata.length; i++) {
      for (let attr in metadata[i]) {
        let sum = 0
        let avgk = []
        if (attr === 'segments_timbre' || attr === 'segments_pitches') {
          const timbres = JSON.parse(metadata[i][attr])
          for (let j = 0; j < timbres.length; j++) {
            for (let k = 0; k < timbres[j].length; k++) {
              sum += timbres[j][k]
            }
            avgk.push((sum / timbres[j].length))
          }
          sum = avgk.reduce((a, b) => a + b)

          if (attr === 'segments_timbre') timbre = sum / avgk.length
          if (attr === 'segments_pitches') pitch = sum / avgk.length
        }
      }
      console.log(pitch, timbre)
      updates.push({ table, condition: { track_id: metadata[i].track_id }, data: { pitch, timbre } })
    }
    await Promise.all(updates.map(db.update))
  }
  process.exit()
}
