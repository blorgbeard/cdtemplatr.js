var React = require("react");
var events = require("../events.js");

var ArtefactsTable = require("./ArtefactsTable.jsx")
var ApproveChangesButton = require("./ApproveChangesButton.jsx")

module.exports = BuildDetails = React.createClass({
  getInitialState: function() {
    return {
      id: 0,
      diff: {
        additions: [],
        deletions: []
      }
    };
  },
  render: function() {
    var content = function() {
      return (
        <div>
          <div><p>{this.state.diff.buildName}</p></div>
          <div><ArtefactsTable rows={this.state.diff.additions} tableHeading="New artefacts in CD"/></div>
          <div><ArtefactsTable rows={this.state.diff.deletions} tableHeading="Artefacts removed from CD"/></div>
          <div><ApproveChangesButton /></div>
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
        this.setState({id: id, diff: data});
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
