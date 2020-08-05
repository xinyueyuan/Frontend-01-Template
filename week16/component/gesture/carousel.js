import { create, Text, Wrapper } from '../createElement'
import { Timeline, Animation, ease} from './animation.js'
import { enableGesture } from './gesture.js'


export class Carousel {
  constructor(config) { 
    this.children = [];
    this.attributes = new Map();
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  appendChild(child) {
    this.children.push(child);
  } 
  mountTo(parent) {
    this.render().mountTo(parent) 
  }
  render() {
    let timeline = new Timeline;
    timeline.start()

    let position = 0;

    let nextPicStopHandler = null;

    

    let children = this.data.map((url, currentPosition) => {
      let onStart = () => {
        timeline.pause()
        clearTimeout(nextPicStopHandler)
      }
  
      let onPan = event => {
        // 需要知道当前图片的index
        let lastPosition = (currentPosition - 1 + this.data.length) % this.data.length;
        let nextPosition = (currentPosition + 1) % this.data.length;

        let lastElement = children[lastPosition];
        let currentElement = children[currentPosition];
        let nextElement = children[nextPosition];
        
        
        let currentTransformValue = Number(currentElement.style.transform.match(/translateX\(([\s\S]+)px\)/)[1])
        let offset = currentTransformValue + 500 * currentPosition

        let lastTransformValue = currentTransformValue - offset
        let nextTransformValue = currentTransformValue + offset
        console.log(currentTransformValue, offset)
      }
      let element = <img src={url} onStart={onStart} onPan={onPan} enableGesture={true}/>;
      element.addEventListener("dragstart", e => e.preventDefault());
      return element; 
    })
    let root = <div class="carousel">
      {children}
    </div> 
    
    let nextPic = () => {
      let nextPosition = (position + 1) % this.data.length;

      let current = children[position];
      let next = children[nextPosition];

      let currentAnimation = new Animation(current.style, "transform", 
        - 100 * position, -100 - 100 * position, 500, 0, ease, v => `translateX(${5 * v}px)`); // 需要在Animation类中一直执行动画
      let nextAnimation = new Animation(next.style, "transform", 
        100 -100 * nextPosition, -100 * nextPosition, 500, 0, ease, v => `translateX(${5 * v}px)`);
      
      timeline.add(currentAnimation)
      timeline.add(nextAnimation)

      
      position = nextPosition;
      nextPicStopHandler = setTimeout(nextPic, 2000); // 最好是在timeline上实现setTimeout
    }
    nextPicStopHandler = setTimeout(nextPic, 2000);
    
   
    return root;
  }
}