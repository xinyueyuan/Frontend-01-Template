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
  if(!style[mainSize]) {  // auto sizing
    elementStyle[mainSize] = 0;
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)) {
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
    // style.flexWrap = 'nowrap';
  }

  var flexLine = [];
  var flexLines = [flexLine];

  var mainSpace = elementStyle[mainSize];
  var crossSpace = 0;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemStyle = getStyle(item);

    if(itemStyle[mainSize] ===  null) {
      itemStyle[mainSize] = 0;
    }

    if(itemStyle.flex) {
      flexLine.push(item);
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
  // console.log(items)

  if (style.flexWrap == 'nowrap' || isAutoMainSize) {
    flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace;  
  } else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    // overflow (happens only if container is single line), scale every item
    var scale = style[mainSize] / (style[mainSize] - mainSpace);
    var currentMain = mainBase;
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle(item);

      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }

      itemStyle[mainSize] = itemStyle[mainSize] * scale;

      // 第一个元素的mainStart就是mainBase
      // 每个元素的起始位置就是currentMain
      // 结束位置就是起始位置+size
      // 把下一个元素的起始位置置为当前元素的结束点
      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      currentMain = itemStyle[mainEnd];
    }
  } else {
    // process each flex line
    flexLines.forEach(function(items) {
      var mainSpace = items.mainSpace;
      var flexTotal = 0;

      for(var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemStyle = getStyle(item);

        if ((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
          flexTotal += itemStyle.flex
          continue;
        }
      } 

      if(flexTotal > 0) {
        // There is a flexible flex items
        var currentMain = mainBase;
        for(var i = 0; i < items.length; i++) {
          var item = items[i];
          var itemStyle = getStyle(item);

          if(itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }
          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = currentMain[mainStart] + mainSign * itemStyle[mainSize]
          currentMain = itemStyle[mainEnd]
        }
      } else {
        // There is *NO* flexible flex items, which means, justify content should work
        if(style.justifyContent === 'flex-start') {
          var currentMain = mainBase;
          var step = 0;
        }
        if(style.justifyContent === 'flex-end') {
          var currentMain = mainSpace * mainSign + mainBase;
          var step = 0;
        }
        if(style.justifyContent === 'center') {
          var currentMain = mainSpace / 2 * mainSign + mainBase;
          var step = 0;
        }
        if(style.justifyContent === 'space-between') {
          var step = mainSpace / (items.length - 1) * mainSign;
          var currentMain = mainBase;
        }
        if(style.justifyContent === 'space-around') {
          var step = mainSpace / items.length * mainSign;
          var currentMain = step / 2 + mainBase;
        }
        for(var i = 0; i < items.length; i++) {
          var item = items[i];
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
          currentMain = itemStyle[mainEnd] + step
        }

      }

    })
  }

  // compute the cross aixs sizes
  // align-items align-self
  var crossSpace;
  if(!style[crossSize]) { // auto sizing
    crossSpace = 0;
    elementStyle[crossSize] = 0;
    for(var i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace
    }
  } else {
    crossSpace = style[crossSize]
    for(var i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace
    }
  }

  if(style.flexWrap === 'wrap-reverse') {
    crossBase = style[crossSize]
  } else {
    crossBase = 0
  }

  var lineSize = style[crossSize] / flexLines.length;

  var step;
  if(style.alignContent === 'flex-start') {
    crossBase += 0;
    step = 0;
  }
  if(style.alignContent === 'flex-end') {
    crossBase += crossSign * crossSpace;
    step = 0;
  }
  if(style.alignContent === 'center') {
    crossBase += crossSign * crossSpace / 2;
    step = 0;
  }
  if(style.alignContent === 'space-between') {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }
  if(style.alignContent === 'space-aruond') {
    step = crossSpace / flexLines.length;
    crossBase += crossSign * step / 2;
  }
  if(style.alignContent === 'stretch') {
    crossBase += 0;
    step = 0;
  }

  flexLines.forEach(function(items) {
    var lineCrossSize = style.alignContent === 'stretch' ? 
      items.crossSpace + crossSpace / flexLines.length : 
      items.crossSpace
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle(item);
      var align = itemStyle.alignSelf || style.alignItems;

      if(itemStyle[crossSize] === null) {
        itemStyle[crossSize] = (align === 'stretch') ? lineCrossSize : 0
      }

      if(align === 'flex-start') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }

      if(align === 'flex-end') {
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
        itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }

      if(align === 'center') {
        itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }

      if(align === 'flex-start') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ? itemStyle[crossSize] : lineCrossSize)
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
      }
    }
    crossBase += crossSign * (lineCrossSize + step);
  });
  console.log(items)

}

module.exports = layout;