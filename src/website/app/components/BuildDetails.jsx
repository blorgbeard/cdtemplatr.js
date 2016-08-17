var React = require("react");
var Promise = require('bluebird');

var moment = require("moment");
var events = require("../events.js");

var ArtefactsTable = require("./ArtefactsTable.jsx")
var ApproveChangesButton = require("./ApproveChangesButton.jsx")


// ---- todo: move out into module

var fetchWithCredentials = function(url, dataType) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      xhrFields: { withCredentials: true },
      dataType: dataType,  
      success: resolve,
      error: (req, status, error) => reject(new Error(status))
    });
  });
};

var Tfs = function(projectUrl) {
  return {
    getBuildDefinition: function(id) {
      return fetchWithCredentials(projectUrl + `/build/definitions/${id}?api-version=2.0`);
    },
    getBuild: function(id) {
      return fetchWithCredentials(projectUrl + `/build/builds/${id}?api-version=2.0`);
    },
    getFile: function(path) {
      return fetchWithCredentials(projectUrl + `/tfvc/items?api-version=1.0&path=${path}`, "text");
    }
  };
};

var TfsFactory = function(baseUrl, projectName) {
  return fetchWithCredentials(baseUrl + "/_apis/projects?api-version=2.0").then(result => {
    var id = result.value.filter(t=>t.name === projectName)[0].id;
    return new Tfs(baseUrl + "/" + id + "/_apis");
  });
};

// --------------------------------

module.exports = BuildDetails = React.createClass({  
  getInitialState: function() {
    return {
      build: {
        "id": -1,
        "name": "NoProjeckt",
        "friendlyName": "No Projekt",
      },
      diff: null
    };
  },
  selectRange(array, value, min, max) {
    var changed = false;
    for (var i = min; i <= max; i++) {
      if (array[i].selected != value) {
        array[i].selected = value;
        changed = true;
      }
    }
    return changed;
  },
  selectAdditions: function(value, min, max) {
    if (this.selectRange(this.state.diff.data.additions, value, min, max)) {
      this.setState(this.state);
    }
  },
  selectDeletions: function(value, min, max) {
    if (this.selectRange(this.state.diff.data.deletions, value, min, max)) {
      this.setState(this.state);
    }
  },
  approveChangesClicked: function() {

    var additions = this.state.diff.data.additions.filter(t=>t.selected);
    var deletions = this.state.diff.data.deletions.filter(t=>t.selected);
    
    this.getTfs.then(tfs => {
      tfs.getFile(this.state.diff.version.tfs.location).then(file => {
        var lines = file.split("\r\n");
        var output = [];
      });
    });
    
  },
  render: function() {
    var content = function() {
      approveButtonEnabled = (
        this.state.diff &&
        this.state.diff.data.additions.concat(this.state.diff.data.deletions).filter(t=>t.selected).length > 0
      );
      return (
        <div>
          <h1>{this.state.build.friendlyName}&nbsp;<span className="text-muted">{this.state.build.branch}</span></h1>          
          {(!!this.state.tfsLastBuild) 
            ? <p>
                <span>{this.state.tfsLastBuild.buildNumber} </span>
                <span>{this.state.tfsLastBuild.result} </span>
                <span title={moment(this.state.tfsLastBuild.finishTime).format('LLLL')} className="fuzzy-date">
                  {moment(this.state.tfsLastBuild.finishTime).fromNow()}
                </span>
              </p>
            : <p className="text-muted">Build state unknown.</p>          
          }          
          <h2>Build output changes</h2>
          {(this.state.hasAdditions || this.state.hasDeletions) ?
            <div>
              {(this.state.hasAdditions) ? 
              <div>
                <ArtefactsTable
                    rows={this.state.diff.data.additions}
                    heading="Files added to build"
                    setSelection={this.selectAdditions} />
              </div>
              : ""}
              {(this.state.hasDeletions) ? 
              <div>
                <ArtefactsTable
                    rows={this.state.diff.data.deletions}
                    heading="Files removed from build"
                    setSelection={this.selectDeletions} />
              </div>
              : "" }
              <div><ApproveChangesButton enabled={approveButtonEnabled} onClicked={this.approveChangesClicked}/></div>
            </div>
          : <p className="bg-success message">The CD is fine! There are no changes to review.</p>}
        </div>
      );
    }.bind(this);
    return <div>{content()}</div>;
  },
  loadFromServer: function(id) {
    $.ajax({
      url: this.props.url + "/" + id,
      dataType: 'json',
      cache: false,
      success: function (data) {
        if (data.diff && data.diff.data) {
          data.hasAdditions = data.diff.data.additions.length > 0;
          data.hasDeletions = data.diff.data.deletions.length > 0;
        }
        this.setState(data);
      }.bind(this),
      error: function (xhr, status, err) {
        //console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
    this.getTfs.then(tfs => {
      tfs.getBuildDefinition(id).then(definition => {
        this.state.tfsDefinition = definition;
        tfs.getBuild(definition.lastBuild.id).then(build => {
          this.state.tfsLastBuild = build;
          this.setState(this.state);
        });
      });
    });    
  },
  componentDidMount: function() {
    this.getTfs = TfsFactory(this.props.tfsUrl, this.props.tfsProject);
    events.subscribe('buildSelected', function(id) {
      //alert('event fired')
      this.loadFromServer(id);
    }.bind(this));
  }
});
