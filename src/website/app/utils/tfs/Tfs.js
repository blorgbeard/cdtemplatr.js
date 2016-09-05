
var get = function(url, dataType) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      headers: {
        accept: "*/*"
      },
      xhrFields: { withCredentials: true },
      cache: false,
      dataType: dataType,  
      success: resolve,
      error: (req, status, error) => {
        reject(new Error(status));
      }
    });
  });
};


var post = function(url, data) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      processData: false,
      xhrFields: { withCredentials: true },
      success: resolve,
      error: (req, status, error) => {
        reject(new Error(status));
      }
    });
  });
};


var Tfs = function(projectUrl) {
  return {
    getBuildDefinition: function(id) {
      return get(`${projectUrl}/build/definitions/${id}?api-version=2.0`);
    },
    getBuild: function(id) {
      return get(`${projectUrl}/build/builds/${id}?api-version=2.0`);
    },
    getFileMetadata: function(path) {
      return get(`${projectUrl}/tfvc/items?api-version=1.0&scopePath=${path}`);
    },
    getFile: function(path, version) {
      return get(`${projectUrl}/tfvc/items?api-version=1.0&versionType=Changeset&version=${version}&path=${path}`, "text");
    },
    commitFile: function(path, version, comment, data) {
      var payload = {
        comment: comment || "Approved CDTemplate",
        changes: [{
          changeType: 2,
          item: {
            path: path,
            contentMetadata: {
              encoding: 65001
            },
            version: version
          },
          newContent: {
            content: data,
            contentType: 0
          }
        }]
      };
      return post(`${projectUrl}/tfvc/changesets?api-version=3.0-preview.2`, payload);
    }
  };
};

module.exports = Tfs;