var express = require('express');
var path = require('path');

var app = express();
app.use(express.static(path.join(__dirname, "../app/dist")));

app.set('view engine', 'hbs');
app.get('/', function (req, res) {
  res.render('index', {title: "cdtemplatr.js"});
});

app.listen(7777, function () {
    console.log("Started listening on port", 7777);
});
