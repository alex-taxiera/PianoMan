module.exports = async function (filepath, handler) {
  const output = require('child_process').spawn('python', [require('path').join(__dirname, '/read.py'), filepath])
  output.stdout.on('data', handler)
}
