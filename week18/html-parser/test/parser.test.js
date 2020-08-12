import { parseHTML } from '../src/parser.js'
import assert from 'assert'

it('parse a single element', function () {
  let doc = parseHTML("<div></div>");
  let div = doc.children[0]
  assert.equal(div.tagName, "div");
  assert.equal(div.children.length, 0);
  assert.equal(div.type, "element");
  assert.equal(div.attributes.length, 2);
});

it('parse a single element with text content', function () {
  let doc = parseHTML("<div>hello</div>");
  let text = doc.children[0].children[0];

  assert.equal(text.content, "hello");
  assert.equal(text.type, "text");
});

it('tag mismatch', function () {
  try {
    let doc = parseHTML("<div></vid>"); 
  } catch (e) {
    assert.equal(e.message, "Tag start and end does not match");
  }
});

it('text with <', function () {
  let doc = parseHTML("<div>a < b</div>"); 
  let text = doc.children[0].children[0];

  assert.equal(text.content, "a < b");
  assert.equal(text.type, "text");
});

it('with property', function () {
  let doc = parseHTML("<div id='a'></div>"); 
  let div = doc.children
  console.log(div)
});