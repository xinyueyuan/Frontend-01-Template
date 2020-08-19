const http = require('http');
const querystring = require('querystring');
const postData = querystring.stringify({ // 这里并不是一个真正的文件
  'content': 'hello world 123!'
})
const options = {
  host: 'localhost',
  port: 8081,
  path: '/?filename=z.html',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
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

req.write(postData);
req.end();




