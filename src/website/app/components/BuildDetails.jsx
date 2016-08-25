var React = require("react");
var Promise = require('bluebird');

var moment = require("moment");
var events = require("../events.js");

var ArtefactsTable = require("./ArtefactsTable.jsx")
var ApproveChangesButton = require("./ApproveChangesButton.jsx")

var patch = require('../utils/patch/patch').patch;
var parseLine = require('../utils/patch/parse').parseLine;

var Tfs = require('../utils/tfs/Tfs');

module.exports = BuildDetails = React.createClass({  
  getInitialState: function() {
    return {
      build: {
        "id": -1,
        "name": "NoProjeckt",
        "friendlyName": "No Projekt",
      },
      diff: null,
      comitting: false
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

    var path = this.state.diff.version.tfs.location;

    this.tfs.getFileMetadata(path).then(metadata => {
      var version = metadata.value[0].version;
      this.tfs.getFile(path, version).then(file => {
        var patched = patch(file, additions, deletions);
        return this.tfs.commitFile(path, version, patched);
      });        
    });
  },
  render: function() {
    var content = function() {
      approveButtonEnabled = (
        this.state.diff &&
        this.state.diff.data &&
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
              <div><ApproveChangesButton
                 enabled={approveButtonEnabled}
                 changeCount={this.state.diff.data.additions.filter(t=>t.selected).length + this.state.diff.data.deletions.filter(t=>t.selected).length} 
                 onClicked={this.approveChangesClicked}
              /></div>
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
        if (!data.diff) {
          data.diff = {"none": "none"};
        }
        data.hasAdditions = data.diff.data && data.diff.data.additions.length > 0;
        data.hasDeletions = data.diff.data && data.diff.data.deletions.length > 0;      
        this.setState(data);
      }.bind(this)      
    });
    
    this.tfs.getBuildDefinition(id).then(definition => {
      this.state.tfsDefinition = definition;
      this.tfs.getBuild(definition.lastBuild.id).then(build => {
        this.setState({tfsLastBuild: build});
      });
    });
        
  },
  componentDidMount: function() {
    this.tfs = new Tfs(this.props.tfs);    
    this.loadFromServer(this.props.id);
  },
  componentWillReceiveProps(nextProps) {
    this.tfs = new Tfs(nextProps.tfs);
    if (this.props.id !== nextProps.id) {
      this.loadFromServer(nextProps.id);
    }
  }
});
