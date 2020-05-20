const css = require('css');
const EOF = Symbol('EOF'); // EOF: end of file 用来匹配结尾
let currentToken = null;
let currentAttribute = null;
let stack = [{
	type: 'document',
	children: []
}];
let currentTextNode = null;


// 加入一个新的函数，addCSSRules，这里我们把css规则暂时存在一个数组里
let rules = [];
function addCSSRules(text) {			
	var ast = css.parse(text);
	// console.log('addCSSRules:', ast)
	// console.log(JSON.stringify(ast, null, "    "));
	rules.push(...ast.stylesheet.rules)
}	

function match(element, selector) {
	if(!selector || !element.attributes) {
		return false;
	}

	if(selector.charAt(0) == '#') {
		var attr = element.attributes.filter(attr => attr.name === 'id')[0]
		if(attr && attr.value === selector.replace('#', '')) {
			return true;
		}
	} else if(selector.charAt(0) == '.') {
		var attr = element.attributes.filter(attr => attr.name === 'class')[0]
		if(attr && attr.value === selector.replace('.', '')) {
			return true;
		}
	} else {
		if(element.tagName === selector) {
			return true;
		}
	}
	return false;
}

function specifity(selector) {
	var p = [0, 0, 0, 0];
	var selectorParts = selector.split("");
	for(var part of selectorParts) {
		if(part.charAt(0) == '#') {
			p[1] += 1;
		} else if(part.charAt(0) == '.') {
			p[2] += 1;
		} else {
			p[3] += 1;
		}
	}
	return p;
}

function compare(sp1, sp2) {
	if(sp1[0] - sp2[0]) {
		return sp1[0] - sp2[0];
	}
	if(sp1[1] - sp2[1]) {
		return sp1[1] - sp2[1];
	}
	if(sp1[2] - sp2[2]) {
		return sp1[2] - sp2[2];
	}
	return sp1[3] - sp2[3]
}

function computeCSS(element) {
	console.log(rules);
	console.log(element);
	// 依次进来html head style body 到body时，已经拿到了所有的rules，可以生成dom with css了
	var elements = stack.slice().reverse(); // 避免污染不断变化的stack
	// css是先去找当前元素匹配，所以要把数组翻转

	if(!element.computedStyle) {
		element.computedStyle = {};
	}

	for(let rule of rules) {
		var selectorParts = rule.selectors[0].split(" ").reverse();
		let matched = false;

		if(!match(element, selectorParts[0])) {
			continue;
		}

		var j = 1;
		for(var i = 0; i < elements.length;i++) {
			if(match(elements[i], selectorParts[j])) {
				j++;
			}
		}

		if(j >= selectorParts.length) {
			matched = true;
		}

		if(matched) {
			// 如果匹配到，就加入
			// console.log('element:', element, 'metched rule:', rule)
			var sp = specifity(rule.selector[0]);
			var computedStyle = element.computedStyle;

			for(var declaration of rule.declarations) {
				if(!computedStyle[declaration.property]) {
					computedStyle[declaration.property] = {}
				}

				if(!computedStyle[declaration.property].specifity) {
					computedStyle[declaration.property].value = declaration.value;
					computedStyle[declaration.property].specifity = sp;
				} else if(compare(computedStyle[declaration.property].specifity, sp) < 0) {
					computedStyle[declaration.property].value = declaration.value;
					computedStyle[declaration.property].specifity = sp;
				}
			}
			// console.log(element.computedStyle);
		}
	}

}

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
			if(p != "type" && p !== "tagName") {
				element.attributes.push({
					name: p,
					value: token[p]
				});	
			}
		}

		computeCSS(element); // 计算css是希望尽可能早的，
		// 如果在pop的时候计算css，有一些结构是会有很大的父标签，比如main的div,main的css computing会放在所有代码最后
		// css有个特点，有些元素的css计算是依赖于父元素的，这样最终的css渲染会非常的迟
		// 正常每个元素出来后要立马对其进行css computing

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
			// 遇到style标签，执行添加css规则的操作
			if(top.tagName === 'style') {
				addCSSRules(top.children[0].content);
			}
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
	// console.log('---------final---------:', stack)
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
			content: c
		})
		return ;
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

module.exports.parseHTML = function parseHTML(html) {
	let state = data;
	for(let c of html) {
		state = state(c); 
	}
	state = state(EOF);
}