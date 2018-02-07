const fs = require('fs')
const h5 = require('../readHDF5')
const path = process.argv[2]

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
    const start = Date.now()
    let song = h5(file)
    console.log(Date.now() - start)
    // we have a song object 'song'
    console.log(typeof song)
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
