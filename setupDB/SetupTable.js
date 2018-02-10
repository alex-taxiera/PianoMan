var md = require('knex')({
  client: 'mysql',          // Variable connection name, match to cloud
  connection: {
    user: '',
    password: '',
    host: 'localhost',
    database: 'million'
  }
})

md.schema.createTable('msd', (table) => {
  table.string('id')
  table.string('title')
  table.integer('year')
  table.string('artist_id')
  table.string('artist_name')
  table.string('similar_artists')             // IDs
  table.string('artist_terms')
  table.float('artist_terms_freq')
  table.float('artist_terms_weight')
  table.float('segments_start')
  table.float('segments_loudness_start')
  table.float('segments_loudness_max_time')
  table.float('segments_loudness_max')
  table.float('beats_start')
  table.float('tatums_start')
  table.float('bars_start')
}).then()
