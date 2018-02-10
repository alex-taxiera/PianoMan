var md = require('knex')({
  client: 'mysql',          // Variable connection name, match to cloud
  connection: {
    user: '',
    password: '',
    host: 'localhost',
    database: 'million'
  }
})

md.schema.createTable('songs', (table) => {
  table.string('id')
  table.string('title')
  table.string('year')
  table.string('artist_id')
  table.string('artist_name')
  table.string('similar_artists')             // IDs
  table.string('artist_terms')
  table.string('artist_terms_freq')
  table.string('artist_terms_weight')
  table.string('sections_start')
  table.string('segments_start')
  table.string('segments_loudness_start')
  table.string('segments_loudness_max_time')
  table.string('segments_loudness_max')
  table.string('beats_start')
  table.string('tatums_start')
  table.string('bars_start')
}).then()
