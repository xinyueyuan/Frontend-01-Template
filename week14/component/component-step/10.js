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
    o.setAttribute(name, attributes[name]); // 区分property和attribute
    // o[name] = attributes[name];  // 不区分property和attribute
  }

  console.log(children);
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
    this.attributes = new Map();
    this.properties = new Map();
    // this.root = document.createElement("div");
  }
  setAttribute(name, value) { // attributes
    // 转交给root
    // this.root.setAttribute(name, value);
    this.attributes.set(name, value)
  }
  appendChild(child) {
    // this.children.push(child); // 建议延迟mount 因为mount是一个生命周期
    this.children.push(child);
  }
  set title(value) {
    this.properties.set("title", value)
  }
  mountTo(parent) {
    this.slot = <div></div>
    for(let child of this.children) {
      this.slot.appendChild(child);
    }
    this.render().mountTo(parent) 
  }
  render() {
    return <article>
      <h1>{this.attributes.get("title")}</h1>
      <h2>{this.properties.get("title")}</h2>
      <header>I'm a header </header>
      {this.slot}
      <footer>I'm a footer </footer>
    </article>
  }
}
// 处理文字类型
let component = <MyComponent title="title1">
    <div>text text text</div>
    <div>{new Wrapper("span")}</div>
    {/* <div>{1}</div> */}
</MyComponent>

component.title = "I am title2" // property


component.mountTo(document.body)