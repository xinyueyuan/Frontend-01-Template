function create(Cls, attributes, ...children) {
  let o = new Cls({
    timer: {}
  });
  for(let name in attributes) {
    o[name] = attributes[name]; // 造成等效的原因在此  o.class= b; 触发了set class
  }

  return o;
}

class Parent {
  set class(v) {
    console.log("parent::class", v) // 此时class的property和attribute等效 都会被打印出来
  }
}

let component = <Parent id="a" class="b">
</Parent>

component.class = "c"