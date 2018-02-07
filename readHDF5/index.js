module.exports = function (filepath) {
  return JSON.parse((require('child_process').spawnSync('python', [require('path').join(__dirname, '/read.py'), filepath])).stdout)
}
