var Smb = require('smb2');
var winauth = require('../conf/windowslogin.json');

var share = "\\\\vistafp\\Data";
var path = "V4CDs\\InTesting";

module.exports = {
  getList: function(callback) {
    var smb = new Smb({
      share: share,
      domain: winauth.domain,
      username: winauth.username,
      password: winauth.password
    });
    smb.readdir(path, function (err, files) {
      if (err) throw err;
      callback(files);
    })
  }
};
