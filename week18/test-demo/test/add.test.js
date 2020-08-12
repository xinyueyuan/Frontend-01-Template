import { add } from '../src/add.js' // node最新版本
import assert from 'assert'

// var assert = require('assert');
// var mod = require('../src/add.js');

// describe('Array', function () {
//   describe('#indexOf()', function () {
//     it('should return -1 when the value is not present', function () {
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });

describe('add', function () {
  it('3 add 4 should equals 7', function () {
      assert.equal(add(3, 4), 7);
    });
});

// const test = require('ava');
// var mod = require('../dist/add.js');

// import { add } from '../src/add.js' // ava可以支持import语法
// import test from 'ava'

// test('foo', t => {
// 	if(add(3, 4) === 7) {
// 		t.pass();
// 	}
// });