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
  let doc = parseHTML("<div id=a class='cls' data=\"abc\" ></div>"); 
  let div = doc.children[0]
  let count = 0
  for(let attr of div.attributes) {
    if(attr.name === "id") {
      assert.equal(attr.value, "a");
      count++;
    }
    if(attr.name === "class") {
      assert.equal(attr.value, "cls");
      count++;
    }
    if(attr.name === "data") {
      assert.equal(attr.value, "abc");
      count++;
    }
  }
  assert.equal(count, 3);
});

it('with property 2', function () {
  let doc = parseHTML("<div id=a class='cls' data=\"abc\"></div>"); 
  let div = doc.children[0]
  let count = 0
  for(let attr of div.attributes) {
    if(attr.name === "id") {
      assert.equal(attr.value, "a");
      count++;
    }
    if(attr.name === "class") {
      assert.equal(attr.value, "cls");
      count++;
    }
    if(attr.name === "data") {
      assert.equal(attr.value, "abc");
      count++;
    }
  }
  assert.equal(count, 3);
});

it('with property 3', function () {
  let doc = parseHTML("<div id=a class='cls' data=\"abc\"/>"); 
  let div = doc.children[0]
  let count = 0
  for(let attr of div.attributes) {
    if(attr.name === "id") {
      assert.equal(attr.value, "a");
      count++;
    }
    if(attr.name === "class") {
      assert.equal(attr.value, "cls");
      count++;
    }
    if(attr.name === "data") {
      assert.equal(attr.value, "abc");
      count++;
    }
  }
  assert.equal(count, 3);
});

it('script', function() {
  let content = `
    <div>abcd</div>
    <span>x</span>
    <
    <s
    <sc
    <scr
    <scri
    <scrip
    <script
    </s
    </sc
    </scr
    </scri
    </scrip
    </script
  `
  let doc = parseHTML(`<script>${content}</script >`)
  let text = doc.children[0].children[0];
  assert.equal(text.content, content);
  assert.equal(text.type, "text");
})

it('attribute with no value', function () {
  let doc = parseHTML("<div class />");
  let div = doc.children[0]
  assert.equal(div.tagName, "div");
  assert.equal(div.children.length, 0);
  assert.equal(div.type, "element");
});



it('attribute with no value', function () {
  let doc = parseHTML("<div class id/>");
  let div = doc.children[0]
  assert.equal(div.tagName, "div");
  assert.equal(div.children.length, 0);
  assert.equal(div.type, "element");
});

