const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const archiver = require('archiver');

// let filename = './cat.jpg'
let packname = './package'


// fs.stat(filename, (error, stat) => {
  const options = {
    host: 'localhost',
    port: 8081,
    path: '/?filename' + 'package.zip',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': 0
    }
  };


  // Make a request
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });


  // create a file to stream archive data to.
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  archive.directory(packname, false);

  archive.pipe(fs.createWriteStream("./package.zip"));

  // good practice to catch this error explicitly
  archive.on('end', function(err) {
    req.end();
  });

  archive.finalize();

  // let readStream = fs.createReadStream('./cat.jpg')
  // readStream.pipe(req)

  // Write data to request body
  // req.write(postData);
  // req.end();
// });




