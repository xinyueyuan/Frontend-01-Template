const http = require('http');
const fs = require('fs');

let filename = './package/cat.jpg' // 可以正确的传一张图片

fs.stat(filename, (error, stat) => {
  const options = {
    host: 'localhost',
    port: 8081,
    path: '/?filename=cat.jpg',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': stat.size
    }
  };
  console.log(options)
  
  // Make a request
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  });
  
  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });
  
  let readStream = fs.createReadStream('./package/cat.jpg')
  readStream.pipe(req)

  readStream.on('end', () => {
    req.end();
  })
})





