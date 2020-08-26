const http = require('http');
const https = require('https');
const fs = require('fs');
// const unzip = require('unzipper')

// Create an HTTP server
const server = http.createServer((req, res) => {
  if(req.url.match(/^\/auth/)) {
    return auth(req, res);
  }

  console.log(req)
  let matched = req.url.match(/filename=([^&]+)/)
  let filename = matched && matched[1]
  if(!filename) {
    return;
  }
  console.log(filename, "filename")
  let writeStream = fs.createWriteStream('../server/public/' + filename)
  // let writeStream = unzip.Extract({
  //   path: '../server/public',
  // })
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

function auth(req, res) {
  let code = req.url.match(/code=([^&]+)/)[1];
  let client_id = "Iv1.e8497cf21367f1a2"
	let client_secret = "1f9a33cc6a13b3fa93847ca6f8163aed6688938d"
	let redirect_uri = encodeURIComponent('http://localhost:8081')
	let state = "bree123"

  let params = `client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}&state=${state}`
  let url = `https://github.com/login/oauth/access_token?${params}`;

	const options = {
    hostname: url,
    port: 8081,
    path: `/login/oauth/access_token?${params}`,
    method: 'POST',
  };

  const request = https.request(options, (response) => {
    response.on('data', (d) => {
      let result = d.toString().match(/access_token=([^&]+)/);

      if (result) {
        let token = result[1];
        console.log('token', token);

        res.writeHead(200, {
          'Set-Cookie': token,
          access_token: token,
          'Content-Type': 'text/html',
        });
        res.end(
          `<a href="http://localhost:8080/publish?token=${token}">publish</a>`,
        );
      } else {
        res.writeHead(200, {
          'Content-Type': 'text/plain',
        });
        res.end('error');
      }
    });
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
}

server.listen(8081)