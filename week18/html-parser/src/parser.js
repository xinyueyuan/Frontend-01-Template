// 文本节点与自封闭标签处理类似
// 多个文本节点需要合并

const EOF = Symbol('EOF'); // EOF: end of file 用来匹配结尾
let currentToken = null;
let currentAttribute = null;
let stack;
let currentTextNode = null;

function emit(token) {
	let top = stack[stack.length - 1];
	if(token.type == 'startTag') {
		let element = {
			type: 'element',
			children: [],
			attributes: []
		};
		element.tagName = token.tagName;
		for(let p in token) {
			if(p != "type" || p != "tagName") {
				element.attributes.push({
					name: p,
					value: token[p]
				});	
			}
		}

		top.children.push(element);
		// element.parent = top;

		if(!token.isSelfClosing) {
			stack.push(element);
		}

		currentTextNode = null;
	} else if(token.type == 'endTag') {
		if(top.tagName != token.tagName) {
			throw new Error('Tag start and end does not match');
		} else {
			stack.pop();
		}
		currentTextNode = null;
	}else if(token.type == 'text') {
		if(currentTextNode == null) {
			currentTextNode = {
				type: 'text',
				content: ''
			}
			top.children.push(currentTextNode);
		}
		currentTextNode.content += token.content;
	}
	// console.log(stack)
}

function data(c) {
	if(c == '<') {
		return tagOpen; // 可能是开始、结束或自封闭标签  先忽略注释
	} else if(c == EOF) {
		emit({
			type: "EOF"
		})
		return ;
	} else {
		emit({
			type: "text",
			content: c
		})
		return data;
	}
}

function tagOpen(c) {
	if(c == '/') {
		return endTagOpen; 
	} else if(c.match(/^[a-zA-Z]$/)) {
		currentToken = {
			type: "startTag",
			tagName: ""
		}
		return tagName(c);
	} else {
		emit({ 
			type: "text",
			content: "<"
		})
		emit({ 
			type: "text",
			content: c
		})
		return data;
	}
}

function tagName(c) {
	if(c.match(/^[\t\n\f ]$/)) {
		return beforeAttributeName; 
	} else if(c == '/') {
		return selfClosingStartTag;
	} else if(c.match(/^[a-zA-Z]$/)) {
		currentToken.tagName += c;
		return tagName;
	} else if(c == '>') {
		emit(currentToken);
		return data;
	} else {
		currentToken.tagName += c;
		return tagName;
	}
}

function beforeAttributeName(c) {
	if(c.match(/^[\t\n\f ]$/)) {
		return beforeAttributeName; 
	} else if(c == '/' || c == '>' || c == EOF) {
		return afterAttributeName(c);
	} else if(c == '=') {

	} else {
		currentAttribute = {
			name: '',
			value: ''
		}
		return attributeName(c);
	}
}

function attributeName(c) {
	if(c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
		return afterAttributeName(c); 
	} else if(c == '=') {
		return beforeAttributeValue; 
	} else if(c == '\u0000') {
		
	} else if(c == '\"' || c == '\'' || c == '<') {
		
	} else {
		currentAttribute.name += c;
		return attributeName;
	}
}

function beforeAttributeValue(c) {
	if(c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
		return beforeAttributeValue; 
	} else if(c == '\"') {
		return doubleQuotedAttributeValue;
	} else if(c == '\'') {
		return singleQuotedAttributeValue;
	} else if(c == '>') {

	} else {
		return unquotedAttributeValue(c);
	}
}

function doubleQuotedAttributeValue(c) {
	if(c == '\"') {
		currentToken[currentAttribute.name] = currentAttribute.value;
		return afterQuotedAttributeValue;
	} else if(c == '\u0000') {

	} else if(c == EOF) {

	} else {
		currentAttribute.value += c;
		return doubleQuotedAttributeValue;
	}
}

function singleQuotedAttributeValue(c) {
	if(c == '\'') {
		currentToken[currentAttribute.name] = currentAttribute.value;
		return afterQuotedAttributeValue;
	} else if(c == '\u0000') {

	} else if(c == EOF) {

	} else {
		currentAttribute.value += c;
		return doubleQuotedAttributeValue;
	}
}

function afterQuotedAttributeValue(c) {
	if(c.match(/^[\t\n\f ]$/)) {
		return beforeAttributeName; 
	} else if(c == '/') {
		return selfClosingStartTag;
	} else if(c == '>') {
		currentToken[currentAttribute.name] = currentAttribute.value;
		emit(currentToken);
		return data;
	} else if(c == EOF) {

	} else {
		currentAttribute.value += c;
		return doubleQuotedAttributeValue;
	}
}

function unquotedAttributeValue(c) {
	if(c.match(/^[\t\n\f ]$/)) {
		currentToken[currentAttribute.name] = currentAttribute.value;
		return beforeAttributeName;
	} else if(c == '/') {
		currentToken[currentAttribute.name] = currentAttribute.value;
		return selfClosingStartTag;
	} else if(c == '>') {
		currentToken[currentAttribute.name] = currentAttribute.value;
		emit(currentToken);
		return data;
	} else if(c == '\u0000') {

	} else if(c == "\"" || c == "\'" || c == "<" || c == "=" || c == "`") {

	} else if(c == EOF) {

	} else {
		currentAttribute.value += c;
		return unquotedAttributeValue;
	}
}


function selfClosingStartTag(c) {
	if(c == '>') {
		currentToken.isSelfClosing = true;
		emit(currentToken);
		return data;
	} else if(c == EOF) {

	} else {

	}
}

function afterAttributeName(c) {
	if(c.match(/^[\t\n\f ]$/)) {
		return afterAttributeName;
	} else if(c == '/') {
		return selfClosingStartTag;
	} else if(c == '=') {
		return beforeAttributeName;
	} else if(c == '>') {
		currentToken[currentAttribute.name] = currentAttribute.value;
		emit(currentToken);
		return data;
	} else if(c == EOF) {

	} else {
		currentToken[currentAttribute.name] = currentAttribute.value;
		currentAttribute = {
			name: '',
			value: ''
		}
		return attributeName(c);
	}
}

function endTagOpen(c) {
	if(c.match(/^[a-zA-Z]$/)) {
		currentToken = {
			type: "endTag",
			tagName: ""
		}
		return tagName(c);
	} else if(c == '>') {
		
	} else if(c == EOF) {
		
	} else {
	}
}

// in script
function scriptData(c) {
	if(c == "<") {
		return scriptDataLessThanSign;
	} else {
		emit({
			type: "text",
			content: c
		})
		return scriptData;
	}
}

// in script received <
function scriptDataLessThanSign(c) {
	if(c == "/") {
		return scriptDataEndTagOpen;
	} else {
		emit({ // 否则会丢数据
			type: "text",
			content: "<"
		})
		emit({
			type: "text",
			content: c
		})
		return scriptData;
	}
}

// in script received </
function scriptDataEndTagOpen(c) {
	if(c == "s") {
		return scriptDataEndTagNameS;
	} else {
		emit({ // 否则会丢数据
			type: "text",
			content: "<"
		})
		emit({ // 否则会丢数据
			type: "text",
			content: "/"
		})
		emit({
			type: "text",
			content: c
		})
		return scriptData;
	}
}

// in script received </s
function scriptDataEndTagNameS(c) {
	if(c == "c") {
		return scriptDataEndTagNameC;
	} else {
		emit({
			type: "text",
			content: "</s"
		})
		emit({
			type: "text",
			content: c
		})
		return scriptData;
	}
}

// in script received </sc
function scriptDataEndTagNameC(c) {
	if(c == "r") {
		return scriptDataEndTagNameR;
	} else {
		emit({
			type: "text",
			content: "</sc"
		})
		emit({
			type: "text",
			content: c
		})
		return scriptData;
	}
}

// in script received </scr
function scriptDataEndTagNameR(c) {
	if(c == "i") {
		return scriptDataEndTagNameI;
	} else {
		emit({
			type: "text",
			content: "</scr"
		})
		emit({
			type: "text",
			content: c
		})
		return scriptData;
	}
}

// in script received </scri
function scriptDataEndTagNameI(c) {
	if(c == "p") {
		return scriptDataEndTagNameP;
	} else {
		emit({
			type: "text",
			content: "</scri"
		})
		emit({
			type: "text",
			content: c
		})
		return scriptData;
	}
}

// in script received </scrip
function scriptDataEndTagNameP(c) {
	if(c == "t") {
		return scriptDataEndTag;
	} else {
		emit({
			type: "text",
			content: "</scrip"
		})
		emit({
			type: "text",
			content: c
		})
		return scriptData;
	}
}

// in script received </script
function scriptDataEndTag(c) {
	if(c == " ") {
		return scriptDataEndTag;
	} else if(c == ">") {
		emit({
			type: "endTag",
			tagName: "script"
		});
		return data;
	} else {
		emit({
			type: "text",
			content: "</script"
		})
		emit({
			type: "text",
			content: c
		})
		return scriptData;
	}
}


// function scriptDataGreaterThanSign(c) {

// }

export function parseHTML(html) {
	stack = [{
		type: 'document',
		children: []
	}]; // 需要在这里重置 不然test case会互相干扰
	let state = data;
	for(let c of html) {
		state = state(c); 
		if(stack[stack.length - 1].tagName === "script" && state == data) {
			// 判断进入到script代码
			state = scriptData;
		}
	}
	state = state(EOF);
	return stack[0];
}