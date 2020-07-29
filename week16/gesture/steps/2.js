// 抽象&复用
let element = document.body;

element.addEventListener("mousedown", event => {
  start(event);
  let mousemove = event => {
    move(event);
  }

  let mouseend = event => {
    end(event);
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseend);
  }

  document.addEventListener("mousemove", mousemove);
  document.addEventListener("mouseup", mouseend);
})

element.addEventListener("touchstart", event => {
  for(let touch of event.changedTouches) {
    // 多指
    start(touch);
  }
});

element.addEventListener("touchmove", event => {
  for(let touch of event.changedTouches) {
    move(touch);
  }
});

element.addEventListener("touchend", event => {
  for(let touch of event.changedTouches) {
    end(touch);
  }
});

element.addEventListener("touchcancel", event => {
  for(let touch of event.changedTouches) {
    cancel(touch);
  }
});
 
let start = point => {
  console.log("Start", point.clientX, point.clientY)
}
 
let move = point => {
  console.log("move", point.clientX, point.clientY)
}
 
let end = point => {
  console.log("end", point.clientX, point.clientY)
}
 
let cancel = point => {
  console.log("cancel", point.clientX, point.clientY)
}