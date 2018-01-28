module.exports = function (filepath) {
  return JSON.parse((require('child_process').spawnSync('python', ['./read.py', filepath])).stdout)
}
