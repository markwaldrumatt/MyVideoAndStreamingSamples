const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.htm'))
})

app.get('/video', function(req, res) {
  // const path = 'https://www.youtube.com/watch?v=DZbLLqbI8GA'
  const path = 'Clip_480_5sec_6mbps_h264.mp4'
  const stat = fs.statSync(path)
  // Save the total file size
  const fileSize = stat.size
  // Save the range the browser is asking for; The range tells us what part
  //  of the file the browser wants (in bytes).
  const range = req.headers.range

  if (range) {
    // convert the range string into an array for easier use.
    const parts = range.replace(/bytes=/, "").split("-")
    // convert the start value into an integer.
    const start = parseInt(parts[0], 10)
    // if the end param is available, convert it to an integer.
    // else we use the fileSize as the last param to send.
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    // Calculate the amount of bits that will be sent back to the browser.
    const chunksize = (end-start)+1
    // Create a stream chunk based on what the browser requested.
    //  path is the video file; start & end combined is the current stream position.
    const file = fs.createReadStream(path, {start, end})
    // Create the header for the HTML5 video tag, so it knows what it is receiving.
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    // Send the custom header
    res.writeHead(206, head)
    // Now pipe the read stream to the response object
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    // This just pipes the read stream to the response object (which goes 
    //   to the client....i.e. we pipe the data through the response object)
    fs.createReadStream(path).pipe(res)
  }
})

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})