var express = require('express');
var path = require('path');
var ntlm = require('express-ntlm');

var app = express();

// serve static stuff like css, js, images..
app.use(express.static(path.join(__dirname, "../app/dist")));

// "authenticate" uses with NTLM (but don't actually check with a domain controller)
app.use(ntlm({
  debug: function() {
    var args = Array.prototype.slice.apply(arguments);
    //console.log.apply(null, args);
  },
  domain: 'AUCKLAND'
  //domaincontroller: 'ldap:// ???'
}));

// serve the main page
app.set('view engine', 'hbs');
app.get('/', function (req, res) {
  res.render('index', {
    title: "cdtemplatr.js"
  });
});

// set up the api that the react components will talk to
var apiRouterFactory = require('./routes/api.js');

// choose a domain!
var domain = require('./domain/testing.js');
//var domain = require('./domain/production.js');

var apiRouter = apiRouterFactory(domain);
app.use('/api', apiRouter);

var input = require('./domain/testing/data/builds.json');

/*  // temp code for munging test data
var output = input.map(build => {
  var buildfilename = build.output.filename;
  if (buildfilename.indexOf('\\') > -1) {
      buildfilename = buildfilename.slice(buildfilename.lastIndexOf('\\') + 1);
  }
  var name = build.name;
  var branch = build.branch;
  if (branch == "") {
    var m = name.match(/^(.*) \((.+)\)$/);
    if (m) {
      name = m[1];
      branch = m[2];
    }
  }
  return {
    id: build.id,
    name: name,
    branch: branch,
    outputLocation: build.outputLocation,
    cdtemplateLocation: build.cdtemplateLocation,
    output: {
      version: build.output.version,
      date: build.output.date,
      number: build.output.number,
      filename: buildfilename,
      cdtemplate: buildfilename.indexOf('cdtemplate') == -1 ? null : buildfilename.replace(/\.exe$/, '.xml')
    },
    cdtemplate: {
      version: 0,
      additions: [],
      deletions: []
    }
  };
});
require('fs').writeFileSync('./builds.json', JSON.stringify(output, null, 4));
//*/


// start serving!
app.listen(7777, function () {
    console.log("Started listening on port", 7777);
});
