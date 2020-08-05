import { create, Text, Wrapper } from './createElement'
import { Carousel } from './gesture/carousel.js'
import { Panel } from './panel/panel.js'
import { TabPanel } from './panel/tabPanel.js'

// let component = <Carousel data={[
//     "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
//     "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
//     "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
//     "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg",
//   ]} />

let panel = <TabPanel title="this is my title">
  <span title="title11">This is content1</span>
  <span title="title2">This is content2</span>
  <span title="title3">This is content3</span>
  <span title="title4">This is content4</span>
</TabPanel>

panel.mountTo(document.body)

window.panel = panel;