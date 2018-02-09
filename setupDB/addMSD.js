const fs = require('fs')
const h5 = require('../readHDF5')
const path = process.argv[2]
let start = true
let queue = []
let count = 0

stats(path)

async function stats (path) {
  // console.log(path)
  fs.stat(path, (err, stat) => {
    if (err) {
      console.error('bad path')
    } else if (stat.isDirectory()) {
      handleDirectory(path)
    } else if (stat.isFile()) {
      handleFile(path)
    }
  })
}

async function handleFile (file) {
  if (file.endsWith('h5')) {
    queue.push(file)
    if (queue.length === 10 && start) {
      start = false
      handleQueue()
    }
  } else {
    console.error('not an h5')
  }
}

async function handleDirectory (dir) {
  fs.readdir(dir, (err, contents) => {
    if (err) {
      console.error(err)
    } else {
      for (let entry of contents) {
        stats(`${dir}/${entry}`)
      }
    }
  })
}

async function handleQueue () {
  while (queue.length > 0 && count < 8) {
    count++
    h5(queue.splice(0, 1)[0], handleData)
  }
}

async function handleData (stdout) {
  count--
  let song = JSON.parse(stdout)
  // do something with song
  // maybe even put it in a DB!
  if (count === 7) {
    handleQueue()
  }
}
