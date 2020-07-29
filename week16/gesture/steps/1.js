let element = document.body;

element.addEventListener("mousedown", event => {
  let mousemove = event => {
    console.log(event)
  }

  let mouseend = (event) => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseend);
  }

  document.addEventListener("mousemove", mousemove);
  document.addEventListener("mouseup", mouseend);
})

element.addEventListener("touchstart", event => {
  // 不同touch事件里的changedTouches[0]不一样 需要用identifier来识别
  console.log(event)
})

element.addEventListener("touchmove", event => {
  console.log(event)
})

element.addEventListener("touchend", event => {
  console.log(event)
})

element.addEventListener("touchcancel", event => {
  // 跟touchend会且只会触发一个
  // 系统事件如屏幕弹窗发生时会触发
  console.log(event)
})