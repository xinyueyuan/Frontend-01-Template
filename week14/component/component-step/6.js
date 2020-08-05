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

class Parent {
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
    child.mountTo(this.root) // child不是dom节点，所以需要mountTo
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

class Child {
  constructor(config) {
    this.children = [];
    this.root = document.createElement("div");
  }
  setAttribue(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mountTo(this.root) // child不是dom节点，所以需要mountTo
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

let component = <Parent id="a" class="b">
  <Child />
  <Child />
  <Child />
</Parent>


component.mountTo(document.body)