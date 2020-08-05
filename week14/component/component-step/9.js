function create(Cls, attributes, ...children) {
  // 框架代码
  let o;

  if(typeof Cls === "string") {
    o = new Wrapper(Cls);
  } else {
    o = new Cls({
      timer: {}
    });
  }



  for(let name in attributes) {
    o.setAttribute(name, attributes[name]);
  }

  console.log(o);
  for(let child of children) {
    if(typeof child === "string")
      child = new Text(child);

    o.appendChild(child);
  }

  return o;
}

class Text {
  constructor(text){
      this.children = [];
      this.root = document.createTextNode(text);
  }
  mountTo(parent){
      parent.appendChild(this.root);
  }
}

class Wrapper{
  constructor(type){
    this.children = [];
    this.root = document.createElement(type);
  }

  setAttribute(name, value) { //attribute
    this.root.setAttribute(name, value);
  }

  appendChild(child){
    this.children.push(child);
  }

  mountTo(parent){
    parent.appendChild(this.root);

    for(let child of this.children){
        child.mountTo(this.root);
    }
  }
}

class MyComponent {
  // 用户代码
  constructor(config) { // 一般不会让config和attribues和children等有关联，因为前者只能在这里被一次的设置，而后者是可以多次更改的
    this.children = [];
    this.root = document.createElement("div");
  }
  setAttribue(name, value) { // attributes
    // 转交给root
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    this.children.push(child); // 建议延迟mount 因为mount是一个生命周期
  }
  mountTo(parent) {
    parent.appendChild(this.root);
    for(let child of this.children) {
      child.mountTo(this.root);
    } 
  }
}
// 处理文字类型
let component = <MyComponent>
    <div>text text text</div>
</MyComponent>


component.mountTo(document.body)