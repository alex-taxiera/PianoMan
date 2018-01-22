const Permission = require('../classes/Permission.js')
const Response = require('../classes/Response.js')

module.exports = new Permission(
  'VIP',
  function (info, member, msg) {
    require('../../TuxedoMan.js').User.getApplication()
    .then((admin) => {
      if (member.id === admin.owner.id) {
        return true
      } else {
        return false
      }
    })
  },
  function (msg) {
    let str = 'Must be guild owner!'
    return new Response(msg, str)
  }
)
