function create(Cls, attributes, ...children) {
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
  constructor(config) { // 一般不会让config和attribues和children等有关联，因为前者只能在这里被一次的设置，而后者是可以多次更改的
    console.log('config:', config)
  }
  set class(v) { // property 
    console.log("parent::class", v) // 只会打印出class c
  }

  setAttribue(name, value) { // attributes
    console.log(name, value) // 打印出class b 和 id a
  }

  appendChild(child) { // children
    console.log('parent::appendChild', child)
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