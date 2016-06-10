var httpntlm = require('httpntlm');
var winauth = require('../conf/windowslogin.json');

var tfsUrl = "http://tfs:8080/tfs/Vista/_apis/build/definitions?api-version=1.0&projectName=Vista";

module.exports = {
  getList: function(callback) {
    httpntlm.get({
      url: tfsUrl,
      workstation: "cdtemplatr",
      username: winauth.username,
      password: winauth.password,
      domain: winauth.domain
    }, function (err, res) {
      callback(err, JSON.parse(res.body));
    });
  }
}
