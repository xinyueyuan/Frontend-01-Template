import { create } from '../createElement'
export class Panel {
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
    return <div class="panel" style="width: 300px; border: 1px solid lightgreen;">
      <h1 style="width: 300px; background-color: lightgreen; margin: 0;">{this.title}</h1>
      <div style="width: 300px; min-height: 300px;">
        { this.children }
      </div>
    </div>
  }
}