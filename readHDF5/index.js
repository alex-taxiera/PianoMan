module.exports = function (filepath) {
  const output = require('child_process').spawnSync('python', [require('path').join(__dirname, '/read.py'), filepath])
  if (`${output.stderr}`) {
    console.log(`${output.stderr}`)
    console.log(filepath)
  } else {
    return JSON.parse(output.stdout)
  }
}
