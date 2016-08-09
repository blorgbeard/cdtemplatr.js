'use strict';

// run this as a one-shot script

var log = requireShared('Log')("tfsPathGuesser");
var Promise = require('bluebird');

var config = requireShared('config');
var NtlmRest = requireShared('tfs/NtlmRest');
var fs = require('fs');

var parseXml = Promise.promisify(require('xml2js').parseString);

requireShared("Domain")(config).then(db => {

  var url = `${config.tfs.protocol}://${config.tfs.server}:${config.tfs.port}/${config.tfs.root}/${config.tfs.collection}`;

  var ca = null; 
  if (config.tfs.protocol === "https" && config.tfs.ca) {
    ca = fs.readFileSync(path.join(PROJECT_ROOT, config.ca));
  }

  var rest = new NtlmRest(url, config.secret.windows, ca);

  var headers = {"Content-Type": "application/soap+xml; charset=utf-8"};

  db.build.getAll().then(builds => {
    builds.map(build => {
      var buildId = build.id; 

      var body = (
        '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body>' + 
        '<QueryBuildDefinitionsByUri xmlns="http://schemas.microsoft.com/TeamFoundation/2010/Build">' +
        `<uris><string>vstfs:///Build/Definition/${buildId}</string></uris>` + 
        '<options>All</options>' + 
        '</QueryBuildDefinitionsByUri>' + 
        '</s:Body></s:Envelope>'
      );

      rest.post("Build/v4.0/BuildService.asmx", {}, body, headers).then(result => {
        parseXml(result).then(
          json => {
            var result = json["soap:Envelope"]["soap:Body"][0].QueryBuildDefinitionsByUriResponse[0].QueryBuildDefinitionsByUriResult[0];
            var definition = result.Definitions[0].BuildDefinition[0];
            var parameters = definition.ProcessParameters[0];
            parseXml(parameters).then(
              params => {
                try {
                  var advanced = params["Dictionary"]["mtbc:BuildParameter"].filter(t => t['$']['x:Key'] === "AdvancedBuildSettings")[0];
                  var advancedDictionary = JSON.parse(advanced["_"]);
                  var postScriptParams = advancedDictionary["PostActionScriptArguments"];
                  //console.log(postScriptParams);
                  var localCdTemplatePath = postScriptParams.match(/-cdTemplatePath "([^"]*)"/)[1];
                  console.log(`${buildId}: ${localCdTemplatePath}`);
                } catch (error) {
                  console.error(`${buildId}: ${error.message}`);
                }
              }
            );
          },    
          // oh well, can't parse this one.
          error => console.error(`${buildId}: ${error.message}`)
        );
      });
    });
  });

});
