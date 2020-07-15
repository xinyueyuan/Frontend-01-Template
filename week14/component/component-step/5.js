function create(Cls, attributes, ...children) {
  // 框架代码
  let o = new Cls({
    timer: {} // config 
  });
  for(let name in attributes) {
    o.setAttribue(name, attributes[name])
  }

  for(let child of children) {
    o.children.push(child);
  }

  return o;
}

class Parent {
  // 用户代码
  constructor(config) { // 一般不会让config和attribues和children等有关联，因为前者只能在这里被一次的设置，而后者是可以多次更改的
    console.log('config:', config)
    this.children = [];
  }
  set class(v) { // property 
    console.log("parent::class", v) // 只会打印出class c
  }

  setAttribue(name, value) { // attributes
    console.log(name, value) // 打印出class b 和 id a
  }
}

class Child {
}

let component = <Parent id="a" class="b">
  <Child />
  <Child />
  <Child />
</Parent>

component.class = "c"