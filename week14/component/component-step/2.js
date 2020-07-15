function create(Cls, attributes, ...children) {
  let o = new Cls({
    timer: {}
  });
  for(let name in attributes) {
    o.setAttribue(name, attributes[name])
  }

  return o;
}

class Parent {
  set class(v) {
    console.log("parent::class", v) // 只会打印出class c
  }

  setAttribue(name, value) {
    console.log(name, value) // 打印出class b 和 id a
  }
}

let component = <Parent id="a" class="b">
</Parent>

component.class = "c"