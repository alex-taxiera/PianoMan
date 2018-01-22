const Permission = require('../classes/Permission.js')
const Response = require('../classes/Response.js')

module.exports = new Permission(
  'VIP',
  function (info, member, msg) {
    if (info.vip && member.hasRole(info.vip)) {
      return true
    }
    return false
  },
  function (msg) {
    let str = 'Must be VIP!'
    return new Response(msg, str)
  }
)
