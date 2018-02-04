const Permission = require('../classes/Permission.js')
const Response = require('../classes/Response.js')

module.exports = new Permission(
  'Admin',
  async function (info, member, msg) {
    let app = await require('../../TuxedoMan.js').User.getApplication()
    if (member.id === app.owner.id) {
      return true
    } else {
      return false
    }
  },
  function (msg) {
    let str = 'Must be bot owner!'
    return new Response(msg, str)
  }
)
