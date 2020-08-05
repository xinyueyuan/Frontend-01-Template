// 个人理解 把carousel.vue里的内容解析成class Carousel形式的js
// 可以认为loader生成了一个虚拟的在内存中完全不存在的文件  做的是一个文本的工作 再由babel对import进行转换 由webpack对结果进行处理
var parser = require("./parser");
module.exports = function(source, map) { // map参数用来做sourcemap
  
  let tree = parser.parseHTML(source); // 先parse 
  let template = null;
  let script = null;

  for(let node of tree.children) { // 取出想要的信息 
    if(node.tagName === "template") {
      template = node.children.filter(e => e.type !== "text")[0];
    }
    if(node.tagName === "script") {
      script = node.children[0].content;
    }
  }
  // let createCode = '';

  let visit = (node) => {  // 转化成想要的create代码
    if(node.type == "text") {
      return JSON.stringify(node.content);
    }
    let attrs = {};
    for(let attribute of node.attributes) {
      attrs[attribute.name] = attribute.value;
    }

    let children = node.children.map(node => visit(node));
    console.log('----------childrend:', children)
    return `create("${node.tagName}", ${JSON.stringify(attrs)}, ${children})`
  }
  
  
  
  let r =  `
import { create, Text, Wrapper } from './createElement';
export class Carousel {
  setAttribute(name, value) {
    this[name] = value;
  }
  render() {
    return ${visit(template)};
  }
  mountTo(parent) {
    this.render().mountTo(parent) 
  }
}
  `;
  // console.log(template);
  console.log(visit(template));
  return r;
}