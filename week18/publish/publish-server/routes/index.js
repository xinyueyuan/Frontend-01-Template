var express = require('express');
var router = express.Router();
const fs = require('fs');

/* GET home page. */
router.post('/', function(req, res, next) {
  console.log(req)
  // res.render('index', { title: 'Express' });
  // fs.writeFileSync("../server/public/2.html", "hello world")
  fs.writeFileSync("../server/public/" + req.query.filename, req.body.content)
});

module.exports = router;
