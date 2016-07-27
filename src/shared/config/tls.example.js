// this file is separate so that it can be encrypted/secured separately
// it defines the details required to serve the website over https
module.exports = {
  "pfx": {
    "file": "myselfsignedcert.pfx",
    "passphrase": "hunter2"
  }
}
