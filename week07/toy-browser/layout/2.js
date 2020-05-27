function getStyle(element) {
  if(!element.style) {
    element.style = {};
  }

  for(let prop in element.computedStyle) {
    var p = element.computedStyle.value;
    element.style[prop] = element.computedStyle[prop].value;

    if(element.style[prop].toString().match(/px$/)) {   // 这里只针对px这个属性值  将其变为一个number类型的整数  可以直接参与计算
      element.style[prop] = parseInt(element.style[prop]);
    }

    if(element.style[prop].toString().match(/^[0-9\.]+$/)) { // 任何数字类型的也会变成整数
      element.style[prop] = parseInt(element.style[prop]);
    }
  }

  return element.style;
}

function layout() {
  // 没有computedStyle属性的元素都不会继续执行，比如head这种
  if(!element.computedStyle) {
    return;
  }

  var elementStyle = getStyle(element); // 预处理

  if(element.display != 'flex') { // 不做除flex布局以外的布局
    return;
  }

  var items = element.children.filter(e => e.type === 'element'); // 筛选掉所有不是元素的节点 如文本节点
  items.sort(function(a, b) {
    return (a.order || 0) - (b.order || 0);
  })

  var style = elementStyle;

  ['width', 'height'].forEach(size => {
    if(style[size] === 'auto' || style[size] === '') {
      style[size] = null;
    }
  })

  // 设置flex布局的默认值
  if(!style.flexDirection || style.flexDirection === 'auto') {
    style.flexDirection = 'row'
  }

  if(!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch'
  }

  if(!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'flex-start'
  }

  if(!style.flexWrap || style.flexWrap === 'auto') {
    style.flexWrap = 'nowrap'
  }

  if(!style.alignContent || style.alignContent === 'auto') {
    style.alignContent = 'stretch'
  }


  var mainSize, mainStart, mainEnd, mainSign, mainBase,
      crossSize, crossStart, crossEnd, crossSign, crossBase;
      /*
        size  尺寸
        start 起始方向
        end   结束方向
        sign  排布的方向  从左往右就是+1  从右往左就是-1
        base  排版的起点
      */

  if(style.flexDirection === 'row') {
    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
    // crossSign和crossBase与另一个属性有关，所以在后面一起设
  }

  if(style.flexDirection === 'row-reverse') {
    mainSize = 'width';
    mainStart = 'right';
    mainEnd = 'left';
    mainSign = -1;
    mainBase = style.width; // 这里是指container的宽度

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if(style.flexDirection === 'column') {
    mainSize = 'height';
    mainStart = 'top';
    mainEnd = 'bottom';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if(style.flexDirection === 'column-reverse') {
    mainSize = 'height';
    mainStart = 'bottom';
    mainEnd = 'top';
    mainSign = -1;
    mainBase = style.height;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if(style.flexWrap === 'wrap-reverse') {
    var tmp = crossStart;
    crossStart = crossEnd;
    crossEnd = tmp;
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }

  // 第二步
  var isAutoMainSize = false;
  if(!style[mainSize]) {  // auto sizing 没有设置宽或高  撑开
    // 如果父元素没有设置宽高  那他的宽高由子元素撑起
    elementStyle[mainSize] = 0;
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)) {
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }

  var flexLine = [];
  var flexLines = [flexLine];

  var mainSpace = elementStyle[mainSize]; // 一行的剩余空间  开始的时候是整个元素的宽高
  var crossSpace = 0; // 每一行交叉轴的空间

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemStyle = getStyle(item);

    if(itemStyle[mainSize] ===  null) {
      itemStyle[mainSize] = 0;
    }

    if(itemStyle.flex) {
      flexLine.push(item); // 如果设置了flex 那么这一行一定要放这个元素
    } else if(style.flexWrap === 'nowrap' && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize];
      if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      flexLine.push(item);
    } else {
      if(itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize]
      }
      if(mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;

        flexLine = [item];
        flexLines.push(flexLine);

        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }
      if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      mainSpace -= itemStyle[mainSize]; 
    }
  }

  flexLines.mainSpace = mainSpace;
  console.log(items)

}

module.exports = layout;