var express = require('express');
var path = require('path');
var ntlm = require('express-ntlm');

var app = express();
app.use(express.static(path.join(__dirname, "../app/dist")));

app.use(ntlm({
  debug: function() {
    var args = Array.prototype.slice.apply(arguments);
    //console.log.apply(null, args);
  },
  domain: 'AUCKLAND'
  //domaincontroller: 'ldap:// ???'
}));

app.set('view engine', 'hbs');
app.get('/', function (req, res) {
  res.render('index', {
    title: "cdtemplatr.js"
  });
});

app.listen(7777, function () {
    console.log("Started listening on port", 7777);
});
