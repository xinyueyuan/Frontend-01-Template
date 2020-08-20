const http = require('http');
const fs = require('fs');
const unzip = require('unzipper')

// Create an HTTP server
const server = http.createServer((req, res) => {
  let matched = req.url.match(/filename=([^&]+)/)
  let filename = matched && matched[1]
  if(!filename) {
    return;
  }
  console.log(filename, "filename")
  // let writeStream = fs.createWriteStream('../server/public/' + filename)
  let writeStream = unzip.Extract({
    path: '../server/public',
  })
  req.pipe(writeStream); // 快捷写法
  // req.on('data', (trunk) => {
  //   writeStream.write(trunk)
  // })
  // req.on('end', (trunk) => {
  //   writeStream.end(trunk)
  // })
  

  res.on('end', () => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('okay');
  });

  
});

server.listen(8081)