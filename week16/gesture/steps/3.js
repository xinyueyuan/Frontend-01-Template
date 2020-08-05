// 添加tap press pan
let element = document.body;
let contexts = Object.create(null);

let MOUSE_SYMBOL = Symbol("mouse");

if(document.ontouchstart !== null) {
  element.addEventListener("mousedown", event => {
    contexts[MOUSE_SYMBOL] = Object.create(null);
    start(event, contexts[MOUSE_SYMBOL]);
    let mousemove = event => {
      move(event, contexts[MOUSE_SYMBOL]);
    }
  
    let mouseend = event => {
      end(event, contexts[MOUSE_SYMBOL]);
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseend);
    }
  
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseend);
  })
}


element.addEventListener("touchstart", event => {
  for(let touch of event.changedTouches) {
    contexts[touch.identifier] = Object.create(null);
    start(touch, contexts[touch.identifier]);
  }
});

element.addEventListener("touchmove", event => {
  for(let touch of event.changedTouches) {
    move(touch, contexts[touch.identifier]);
  }
});

element.addEventListener("touchend", event => {
  for(let touch of event.changedTouches) {
    end(touch, contexts[touch.identifier]);
    delete contexts[touch.identifier];
  }
});

element.addEventListener("touchcancel", event => {
  for(let touch of event.changedTouches) {
    cancel(touch, contexts[touch.identifier]);
    delete contexts[touch.identifier];
  }
});
 
let start = (point, context) => {
  context.startX = point.clientX
  context.startY = point.clientY

  context.isTap = true;
  context.isPan = false;
  context.isPress = false;
  context.timoutHandler = setTimeout(() => {
    if(context.isPan) return // pan的优先级比press高

    context.isTap = false;
    context.isPan = false;
    context.isPress = true;
    console.log('press start')
  }, 500)
}
 
let move = (point, context) => {
  let dx = point.clientX - context.startX
  let dy = point.clientY - context.startY
  
  if(dx ** 2 + dy ** 2 && !context.isPan) {
    context.isTap = false;
    context.isPan = true;
    context.isPress = false;
    console.log('pan start')
  }

  if(context.isPan) {
    console.log('pan move')
  }
}
 
let end = (point, context) => {
  if(context.isPan) {
    console.log('pan end')
  }
  if(context.isTap) {
    console.log('tap end')
  }
  if(context.isPress) {
    console.log('press end')
  }
  clearTimeout(context.timoutHandler)
}
 
let cancel = (point, context) => {
  console.log("cancel")
  clearTimeout(context.timoutHandler)
}