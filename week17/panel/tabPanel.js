import { create } from '../createElement'
export class TabPanel {
  constructor(config) { 
    this.children = [];
    this.attributes = new Map();
    this.state = Object.create(null);
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  getAttribute(name) {
    console.log(1, this[name])
    return this[name];
  }
  appendChild(child) {
    this.children.push(child);
  } 
  mountTo(parent) {
    this.render().mountTo(parent) 
  }
  select(i) {
    for(let view of this.childViews) {
      view.style.display = "none"
    }
    this.childViews[i].style.display = ""

    for(let view of this.titleViews) {
      view.classList.remove("selected");
    }
    this.titleViews[i].classList.add("selected");
    
  }
  render() { 
    this.childViews = this.children.map(child => <div style="width: 300px; min-height: 300px;">{child}</div>)
    this.titleViews = this.children.map((child, i) => {
      return <span onClick={() => this.select(i)} style="width: 300px; min-height: 300px;">{child.getAttribute("title")}</span>
    })

    this.select(0)
    return <div class="tab-panel" style="width: 300px; border: 1px solid lightgreen;">
      <h1 style="width: 300px; background-color: lightgreen; margin: 0;">{this.titleViews}</h1>
      <div>
        { this.childViews  }
      </div>
    </div>
  }
}