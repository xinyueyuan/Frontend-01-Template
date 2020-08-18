export class Timeline {
  constructor() {
    this.animation = [];
  }
  tick() {
    let t = this.startTime - Date.now();

    for(let animation of this.animation) {
      if(t > animation.duration + animation.delay) {
        continue;
      }
      let { object, property, start, end, timingFunction, delay } = animation;
      object[property] = timingFunction(start, end)(t - delay);
    }
    requestAnimationFrame(() => this.tick());
  }
  start() {
    this.startTime = Date.now();
    this.tick();
  }

  add(animation) {
    this.animation.push(animation);
  }
}

export class Animation {
  constructor(object, property, start, end , duration, delay, timingFunction) {
    this.object = object;
    this.property = property;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.delay = delay || 0;
    this.timingFunction = timingFunction || ((start, end) => {
      return (t) => start + (t / duration) * (end - start)
    });
  }
}

/*
let animation = new Animation(object, property, start, end , duration, dealy, timingFunction);
let animation2 = new Animation(object2, property2, start, end , duration, dealy, timingFunction);

let timeline = new Timeline; 用来控制所有的animation 1）管理所有的动画 2） 性能提升：TODO
timeline.add(animation);
timeline.add(animation2);

timeline.start();
timeline.pause();
timeline.resume();
timeline.stop();


不可避免的用到
setTimeout
setInterval
requestAnimationFrame

*/