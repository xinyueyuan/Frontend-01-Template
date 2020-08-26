const http = require('http');
var fs = require('fs');
const archiver = require('archiver');
const child_process = require('child_process');

let packname = './package' // 多文件打包上传

const options = {
  host: 'localhost',
  port: 8081,
  path: '/?filename=' + 'package.zip',
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-steam'
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

archive.finalize();

archive.pipe(req);

// good practice to catch this error explicitly
archive.on('end', () => {
  console.log('ednend')
  req.end();
  let redirect_uri = encodeURIComponent('http://localhost:8081/auth?id=123')
  child_process.exec(`open https://github.com/login/oauth/authorize?client_id=Iv1.e8497cf21367f1a2&redirect_uri=${redirect_uri}&state=bree123`)
});






