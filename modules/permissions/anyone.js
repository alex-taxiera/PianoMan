const Permission = require('../classes/Permission.js')

module.exports = new Permission(
  'Anyone',
  function (info, member, msg) {
    return true
  }
)
