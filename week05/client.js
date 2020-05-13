const net = require('net');
class Request {
	// method, url=host+port+path
	// body: k-v
	// headers
	constructor(options) {
		this.method = options.method || "GET";
		this.host = options.host;
		this.port = options.port || 80;
		this.path = options.path || "/";
		this.body = options.body || {};
		this.headers = options.headers || {};
		if(!this.headers["Content-Type"]) {
			this.headers["Content-Type"] = "application/x-www-form-urlencoded"; //一定要根据content-type去编码body的文字
		}
		if(this.headers["Content-Type"] === 'application/json') {
			this.bodyText = Json.stringify(this.body)
		} else if(this.headers["Content-Type"] === 'application/x-www-form-urlencoded') {
			this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
		}
		this.headers["Content-Length"] = this.bodyText.length
	}

	toString() {
		return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}\r
		`
	}

	open(method, url) {

	}

	send(connection) {
		return new Promise((resolve, reject) => {
			const parser = new ResponseParser;
			if(connection) {
				connection.write(this.toString())
			} else {
				connection = net.createConnection({
					host: this.host,
					port: this.port
				}, () => {
					connection.write(this.toString())
				})
			}
			connection.on('data', (data) => { // 因为tcp连接是流数据,data有可能不是一个完整的response
				// onData事件可能会被触发多次，所以不会设计成new Response(data)
				parser.receive(data.toString())
				if(parser.isFinished) {
					resolve(parser.response);
				}
				// resolve(data.toString());
				connection.end();
			});
			connection.on('error', (err) => {
				reject(err);
				connection.end();
			});
		})
	}
}

class Response {

}

class ResponseParser {
	// 负责去产生response class
	// 不能用正则，因为是流数据传输，所以返回的数据不知道在什么地方中断（在任何地方断开都有可能）。只能用状态机
	// 数据断开的可能:  1、客户端的buffer满了 2、服务端收到一个ip包
	// 处理字符流
	constructor(options) {
		this.WAITING_STATUS_LINE = 0;
		this.WAITING_STATUS_LINE_END = 1;
		this.WAITING_HEADER_NAME = 2;
		this.WAITING_HEADER_SPACE = 3;
		this.WAITING_HEADER_VALUE = 4;
		this.WAITING_HEADER_LINE_END = 5;
		this.WAITING_HEADER_BLOCK_END = 6;
		this.WAITING_BODY = 7;

		this.current = this.WAITING_STATUS_LINE;
		this.statusLine = "";
		this.headers = {};
		this.headerName = "";
		this.headerValue = "";
		this.bodyParser = null;
	}

	get isFinished() {
		return this.bodyParser && this.bodyParser.isFinished
	}

	get response() {
		this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
		return {
			statusCode: RegExp.$1,
			statusText: RegExp.$2,
			headers: this.headers,
			body: this.bodyParser.content.join('')
		}
	}

	receive(string) {
		for(let i = 0; i < string.length; i++) {
			this.receiveChar(string.charAt(i)); 
		}
	}

	receiveChar(char) {
		console.log(JSON.stringify(char))
		if(this.current === this.WAITING_STATUS_LINE) {
			if(char === '\r') {
				this.current = this.WAITING_STATUS_LINE_END;
			} else if(char === '\n'){
				this.current = this.WAITING_HEADER_NAME;
			} else {
				this.statusLine += char;
			}
		} else if(this.current === this.WAITING_STATUS_LINE_END) {
			if(char === '\n'){
				this.current = this.WAITING_HEADER_NAME;
			}
		} else if(this.current === this.WAITING_HEADER_NAME) {
			if(char === ':') {
				this.current = this.WAITING_HEADER_SPACE;
			} else if(char === '\r') {
				this.current = this.WAITING_HEADER_BLOCK_END;
				// 只有在这里才知道encoding的方式
				if(this.headers['Transfer-Encoding'] === 'chunked') {
					this.bodyParser = new TrunkedBodyParser
				}
			} else {
				this.headerName += char;
			}
		} else if(this.current === this.WAITING_HEADER_SPACE) {
			if(char === ' '){
				this.current = this.WAITING_HEADER_VALUE;
			}
		} else if(this.current === this.WAITING_HEADER_VALUE){
			if(char === '\r') {
				this.current = this.WAITING_STATUS_LINE_END;
				this.headers[this.headerName] = this.headerValue;
				this.headerName = '';
				this.headerValue = '';
			} else {
				this.headerValue += char;
			}
		} else if(this.current === this.WAITING_STATUS_LINE_END) {
			if(char === '\n'){
				this.current = this.WAITING_HEADER_NAME;
			}
		} else if(this.current === this.WAITING_HEADER_BLOCK_END) {
			if(char === '\n'){
				this.current = this.WAITING_BODY;
			}
		} else if(this.current === this.WAITING_BODY) {
			this.bodyParser.receiveChar(char);
		}
	}
}

class TrunkedBodyParser {
	constructor(options) {
		this.WAITING_LENGTH = 0;
		this.WAITING_LENGTH_LINE_END = 1;
		this.READING_TRUNK = 2;
		this.WAITING_NEW_LINE = 3;
		this.WAITING_NEW_LINE_END = 4;

		this.length = 0;
		this.content = [];
		this.isFinished = false;
		this.current = this.WAITING_LENGTH
	}

	receiveChar(char) {
		// console.log(JSON.stringify(char))
		if(this.current === this.WAITING_LENGTH) {
			if(char === '\r') {
				if(this.length === 0) {
					console.log('////')
					console.log(this.content)
					this.isFinished = true;
				} else {
					this.current = this.WAITING_LENGTH_LINE_END;
				}
			} else {
				this.length *= 10;
				this.length += char.charCodeAt(0) - '0'.charCodeAt(0);
			}
		} else if(this.current === this.WAITING_LENGTH_LINE_END) {
			if(char === '\n'){
				this.current = this.READING_TRUNK;
			}
		} else if(this.current === this.READING_TRUNK) {
			this.content.push(char);
			this.length--;
			if(this.length === 0) {
				this.current = this.WAITING_NEW_LINE;
				console.log(this.length, this.current)
			}
		} else if(this.current === this.WAITING_NEW_LINE) {
			if(char === '\r'){
				this.current = this.WAITING_NEW_LINE_END;
			}
		} else if(this.current === this.WAITING_NEW_LINE_END) {
			if(char === '\n'){
				this.current = this.WAITING_LENGTH;
			}
		}
	}
}

void async function() {
	let request = new Request({
		method: "POST",
		host: "127.0.0.1",
		port: 8088,
		path: '/',
		headers: {
			["X-Foo2"]: "bar",
			["name"]: "11"
		},
		body: {
			name: "bree"
		}
	})
	let response = await request.send();
	console.log('response:', response)
}();




/*const net = require('net'); //使用net而不是http去访问server,拿回我们所要的html
const client = net.createConnection({ 
	host: '127.0.0.1',
	port: 8088 }, () => {
	// 'connect' listener.
	console.log('connected to server!');
	// client.write('world!\r\n'); // 直接这样写，会返回一个400
	let request = new Request({
		method: "POST",
		host: "127.0.0.1",
		port: 8088,
		path: '/',
		headers: {
			["X-Foo2"]: "bar"
		},
		body: {
			name: "bree"
		}
	})
	console.log(request.toString());
	client.write(request.toString());

	// client.write('POST / HTTP/1.1\r\n');
	// client.write('HOST: 127.0.0.1\r\n');
	// client.write('Content-Length: 20\r\n');
	// client.write('Content-Type: application/x-www-form-urlencoded\r\n');
	// client.write('\r\n');
	// client.write('field1=aaa&code=x%3D1\r\n');
	// client.write('\r\n');
});
client.on('data', (data) => {
	console.log('ondata:',data.toString());
	client.end();
});
client.on('end', () => {
	console.log('disconnected from server');
});
client.on('error', (data) => {
	console.log('error', data.toString());
	client.end();
}); */