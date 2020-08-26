// console.log('Hello, world!');
// phantom.exit();

var page = require('webpage').create();
page.open('http://localhost:8080/', function(status) {
  if(status === "success") {
    // page.render('geekbang.png');
    var body = page.evaluate(function() {
      var toString = function(pad, element) {
        var children = element.childNodes;
        var childrenString = '';
        for(var i = 0; i < children.length; i++) {
          childrenString += toString("    " + pad, children[i]) + '\n';
        }
        var name // 不支持let
        if(element.nodeType === Node.TEXT_NODE) {
          name = "#text " + JSON.stringify(element.textContent)
        }
        if(element.nodeType === Node.ELEMENT_NODE) {
          name = element.tagName
        }
        return pad + name + (children && children.length ? '\n' + childrenString : '')
      }
      return toString("", document.body);
      // return document.body.tagName
    });
    console.log(body)
    // console.log(1111, document.body.children[0].toString());
  }
  phantom.exit();
});