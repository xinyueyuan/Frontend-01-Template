/*
进一步需求：
移动端如何区分点击和左右滑动  事件都一样 mousedown mousemove mouseend
移动兼容  
首饰库
关闭系统手势事件

tap 
pan  用手去拖拽一个物体  - panstart panmove panend
flick/swiper 与pan类似，速度非常块，并且手要立即离开屏幕
press  - pressstart pressend

touch事件不需要在element上监听 在那个上起始就会在哪个上触发 有天然的目标锁定的能力
不同touch事件里的changedTouches[0]不一样 需要用identifier来识别
touchcancel跟touchend会且只会触发一个  系统事件如屏幕弹窗发生时会触发


*/
function enableGesture(element) {
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
    console.log('touchstart')
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
    let event = new CustomEvent('start')
    Object.assign(event, {
      startX: point.clientX,
      startY: point.clientY,
      clientX: point.clientX,
      clientY: point.clientY
    })
    element.dispatchEvent(event)

    context.startX = point.clientX
    context.startY = point.clientY

    context.moves = []

    context.isTap = true;
    context.isPan = false;
    context.isPress = false;
    context.timoutHandler = setTimeout(() => {
      if(context.isPan) return // pan的优先级比press高

      context.isTap = false;
      context.isPan = false;
      context.isPress = true;
      
      element.dispatchEvent(new CustomEvent('pressstart', {}))
    }, 500)
  }
  
  let move = (point, context) => {
    let dx = point.clientX - context.startX
    let dy = point.clientY - context.startY

    
    
    if(dx ** 2 + dy ** 2 && !context.isPan) {
      if(context.isPress) {
        element.dispatchEvent(new CustomEvent('presscancel', {}))
      }
      context.isTap = false;
      context.isPan = true;
      context.isPress = false;
      
      let event = new CustomEvent('panstart')
      Object.assign(event, {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY
      })
      element.dispatchEvent(event)
    }

    if(context.isPan) {
      context.moves.push({
        dx, dy,
        t: Date.now()
      })
      context.moves = context.moves.filter(record => Date.now() - record.t < 300); // 只算最后0.3s
      
      let event = new CustomEvent('pan')

      
      Object.assign(event, {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY
      })
      // 需要在这里赋值
      element.dispatchEvent(event)
    }
  }
  
  let end = (point, context) => {
    if(context.isPan) {
      let dx = point.clientX - context.startX
      let dy = point.clientY - context.startY

      let record = context.moves[0]
      let speed = Math.sqrt(((record.dx - dx) ** 2 + (record.dy - dy) ** 2) / (Date.now() - record.t))  

      let isFlick = speed > 2.5
      if(isFlick) {
        let event = new CustomEvent('flick')
        Object.assign(event, {
          startX: context.startX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY,
          speed
        })
        element.dispatchEvent(event)
      }
      let event = new CustomEvent('panend')
      Object.assign(event, {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        speed,
        isFlick
      })
      element.dispatchEvent(event)
    }
    if(context.isTap) {
      element.dispatchEvent(new CustomEvent('tap', {}))
    }
    if(context.isPress) {
      element.dispatchEvent(new CustomEvent('pressend', {}))
    }
    clearTimeout(context.timoutHandler)
  }
  
  let cancel = (point, context) => {
    element.dispatchEvent(new CustomEvent('canceled', {}))  
    clearTimeout(context.timoutHandler)
  }
}

