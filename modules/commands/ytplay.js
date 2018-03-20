const music = require('../music.js')
const Command = require('../classes/Command.js')

module.exports = new Command(
  'ytplay',
  'Searches for a video or playlist on YouTube and adds it to the queue',
  ['query'],
  'Anyone in Voice',
  function (msg, params) {
    let fullParam = params.join(' ')
    return music.searchVideo(msg, fullParam)
  }
)
