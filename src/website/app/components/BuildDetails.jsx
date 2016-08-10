var React = require("react");
var moment = require("moment");
var events = require("../events.js");

var ArtefactsTable = require("./ArtefactsTable.jsx")
var ApproveChangesButton = require("./ApproveChangesButton.jsx")

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
    var additions = (
      this.state.diff.data.additions
        .map((row, index) => ({row:row, index: index}))
        .filter(t=>t.row.selected)
        .map(t=>t.index)
      );
    var deletions = (
        this.state.diff.data.deletions
          .map((row, index) => ({row:row, index: index}))
          .filter(t=>t.row.selected)
          .map(t=>t.index)
        );
    $.ajax({
      url: this.props.url + "/approve/" + this.state.build.id,
      type: 'get',
      contentType: 'application/json',
      data: {
        additions: additions,
        deletions: deletions
      },
      dataType: 'json',
      success: function (data) {
        toastr.success(data, "Success!");
        this.loadFromServer(this.state.build.id);
        events.raise('buildListShouldUpdate');
      }.bind(this),
      error: function (xhr, status, err) {
        //console.error(this.props.url, status, err.toString());
      }.bind(this)
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
          <p>Version: {"(unknown)"},
             built {(!!this.state.output)
              ? <span title={moment(this.state.output.finishTime).format('LLLL')} className="fuzzy-date">
                {moment(this.state.output.finishTime).fromNow()}
               </span>
             : "(unknown)"
            }.
          </p>
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
          data.diff.data.additions = data.diff.data.additions.map(filename=>({filename: filename}));
          data.diff.data.deletions = data.diff.data.deletions.map(filename=>({filename: filename}));
          data.hasAdditions = data.diff.data.additions.length > 0;
          data.hasDeletions = data.diff.data.deletions.length > 0;
        }
        this.setState(data);
      }.bind(this),
      error: function (xhr, status, err) {
        //console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    events.subscribe('buildSelected', function(id) {
      //alert('event fired')
      this.loadFromServer(id);
    }.bind(this));
  }
});
