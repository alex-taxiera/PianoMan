// script that creates tables
var md = require('knex')({
  client: 'mysql',          // Variable connection name, match to cloud
  connection: {
  }
})

md.schema.createTable('artists', (table) => {
  table.charset('utf8')
  table.string('artist_id').primary()
  table.text('name', 'longtext')
  table.float('hotttnesss')
  table.text('location', 'longtext')
  table.float('longitude')
  table.float('latitude')
  table.float('familiarity')
  table.text('mbtags', 'longtext')
  table.text('mbtags_count', 'longtext')
  table.text('terms', 'longtext')
  table.text('terms_freq', 'longtext')
  table.text('terms_weight', 'longtext')
  table.text('similar_artists', 'longtext') // IDs
}).then(() => {
  md.schema.createTable('metadata', (table) => {
    table.charset('utf8')
    table.string('track_id').primary()
    table.float('duration')
    table.float('hotttnesss')
    table.float('danceability')
    table.float('energy')
    table.float('loudness')
    table.integer('key')
    table.integer('mode')
    table.float('tempo')
    table.integer('time_signature')
    table.float('analysis_sample_rate')
    table.float('end_of_fade_in')
    table.float('start_of_fade_out')
    table.text('sections_start', 'longtext')
    table.text('segments_start', 'longtext')
    table.text('segments_loudness_start', 'longtext')
    table.text('segments_loudness_max_time', 'longtext')
    table.text('segments_loudness_max', 'longtext')
    table.text('beats_start', 'longtext')
    table.text('tatums_start', 'longtext')
    table.text('bars_start', 'longtext')
    table.text('segments_timbre', 'longtext')
    table.text('segments_pitches', 'longtext')
  }).then(() => {
    md.schema.createTable('songs', (table) => {
      table.charset('utf8')
      table.string('song_id').primary()
      table.text('title', 'longtext')
      table.text('album', 'longtext')
      table.specificType('year', 'year')
      table.string('artist_id').references('artist_id').inTable('artists')
      table.string('track_id').references('track_id').inTable('metadata')
    }).then(() => {
      md.schema.createTable('users', (table) => {
        table.charset('utf8')
        table.string('user_id').primary()
        table.text('recent_songs', 'longtext')
      }).then(() => { md.destroy() })
    })
  })
})
