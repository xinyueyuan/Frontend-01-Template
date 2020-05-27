const EOF = Symbol('EOF'); // EOF: end of file 用来匹配结尾
const css = require('css');
const layout = require('./layout.js');
let currentToken = null;
let currentAttribute = null;
let stack = [{
	type: 'document',
	children: []
}];
let currentTextNode = null;


// 加入一个新的函数，addCssRules， 这里我们把css规则暂存在一个数组里
let rules = [];
function addCssRules(text) {
  var ast = css.parse(text)
  rules.push(...ast.stylesheet.rules)
}

function match(element, selector) {
  if(!selector || !element.attributes) {
    return false;
  }

  if(selector.charAt(0) == '#') {
    var attr = element.attributes.filter(attr => attr.name === "id")[0]
    if(attr && attr.value === selector.replace('#', '')) {
      return true;
    }
  } else if(selector.charAt(0) == '.') {
    var attr = element.attributes.filter(attr => attr.name === 'class')[0]
    // 这里暂时没有使用空格分隔class的逻辑
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

function specificity(selector) {
  //这里没有支持复合选择器  比如a.x#y
  var p = [0, 0, 0, 0]; // [0, id, class, tag]
  var selectParts = selector.split(' ');
  for(var part of selectParts) {
    if(part.charAt(0) == "#") {
      p[1] += 1;
    } else if(part.charAt(0) == ".") {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}

function compare(sp1, sp2) {
  if(sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0]
  } else if(sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1]
  } else if(sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2]
  }
  return sp1[3] - sp2[3]
}

function computesCss(element) {
  // element这里依次进来html head style body div image
  // 遇到body的时候就开始匹配css
  // console.log(rules, element)

  // 当element是head时，它的父元素此时就储存在stack里  stack = [documnt, html]
  var elements = stack.slice().reverse(); // 避免这里的操作污染stack  reverse之后先拿到element的父元素 从里往外找

  if(!element.computedStyle) {
    element.computedStyle = {};
	}

  for(let rule of rules) {
    var selectParts = rule.selectors[0].split(" ").reverse() // #myid div body

    if(!match(element, selectParts[0])) {
      continue;
		}
		
		let matched = false;

    var j = 1;
    for(i = 0; i < elements.length; i++) {
      if(match(elements[i], selectParts[j])) {
        j++;
      }
    }

    if(j >= selectParts.length) {
      matched = true;
		}
		
		if(matched) {
			// 如果匹配到 我们要加入
      // console.log("elemnt:", element, "matched rule", rule)
      var computedStyle = element.computedStyle
      var sp = specificity(rule.selectors[0])

      for(let declaration of rule.declarations) {
        if(!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {}
        }

        if(!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].specificity = sp
          computedStyle[declaration.property].value = declaration.value
        } else if(compare(computedStyle[declaration.property].specificity, sp) < 0) {
          computedStyle[declaration.property].specificity = sp
          computedStyle[declaration.property].value = declaration.value
        }

        // computedStyle[declaration.property].value = declaration.value
      }
      // console.log(element.computedStyle)
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
    
    //  有一个元素被创建的过程，就有一个css computing的过程
    //  和style的不一样
    /*  这一步希望尽可能的早  有一些结构会是有很大的父标签，比如说main的div，这样main的css计算会放在所有代码的最后
     css有一个特点是有一些元素的css计算依赖于父元素，这样比较耗时，所以最好是每个元素刷出来后就对其进行css计算 */
    computesCss(element);

		top.children.push(element);

		if(!token.isSelfClosing) {
			stack.push(element);
		}

		currentTextNode = null;
	} else if(token.type == 'endTag') {
		if(top.tagName != token.tagName) {
			throw new Error('Tag start and end does not match');
		} else {


      // 在遇到style标签时，执行添加css规则的操作
      if(top.tagName == 'style') {
        addCssRules(top.children[0].content);
      }
      
			// 在拿到子元素的时候才能开始布局
			// 实际layout是根据属性来判断不同的阶段  比如：如果是正常流，就可以在tagStart的时候开始layout
			layout(top);

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
	return stack[0];
}