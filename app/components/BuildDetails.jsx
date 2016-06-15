var React = require("react");
var moment = require("moment");
var events = require("../events.js");

var ArtefactsTable = require("./ArtefactsTable.jsx")
var ApproveChangesButton = require("./ApproveChangesButton.jsx")

module.exports = BuildDetails = React.createClass({
  getInitialState: function() {
    return {
      "id": -1,
      "name": "No Projeckt",
      "branch": "Dev",
      "outputLocation": "\\\\vistafp\\Data\\V4CDs\\InTesting\\HeadOffice_Dev",
      "cdtemplateLocation": "$/Vista/Main/HeadOffice/HeadOffice/HeadOfficeCDTemplate.xml",
      "output": {
        "version": "4.5.6.0.9901",
        "date": "20160614",
        "number": "1",
        "filename": "HeadOffice_Dev_4.5.6.0.9901_20160614.1_cdtemplate.exe",
        "cdtemplate": "HeadOffice_Dev_4.5.6.0.9901_20160614.1_cdtemplate.xml"
      },
      "cdtemplate": {
        "version": 0,
        "additions": [
          "\\no\\such\\file.xml",
          "\\there\\are\\no\\files\\here.html"
        ],
        "deletions": [
          "\\deleted\\file\\here.exe.jpg"
        ]
      }
    };
  },
  render: function() {
    var content = function() {
      return (
        <div>
          <h1>{this.state.name}&nbsp;<span className="text-muted">{this.state.branch}</span></h1>
          <p>Version: {this.state.output.version}, built <span title={moment(this.state.output.date).format('LLLL')} className="fuzzy-date">
              {moment(this.state.output.date).fromNow()}
          </span>.</p>
          <p>Link to build: <a href={"file:" + this.state.outputLocation}>{this.state.output.filename}</a></p>
          <h2>Build output changes</h2>
          {(!!this.state.output.cdtemplate) ?
            <div>
              <div><ArtefactsTable rows={this.state.cdtemplate.additions} tableHeading="New artefacts in CD"/></div>
              <div><ArtefactsTable rows={this.state.cdtemplate.deletions} tableHeading="Artefacts removed from CD"/></div>
              <div><ApproveChangesButton /></div>
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
