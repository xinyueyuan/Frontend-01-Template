function create(Cls, attributes, ...children) {
  // 框架代码
  let o = new Cls({
    timer: {} // config 
  });
  for(let name in attributes) {
    o.setAttribue(name, attributes[name])
  }

  for(let child of children) {
    o.appendChild(child);
  }

  return o;
}

class Div {
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

let component = <Div id="a" class="b" style="width: 100px; height: 100px; background-color: lightgreen;">
  <Div />
  <Div />
  <Div />
</Div>


component.mountTo(document.body)