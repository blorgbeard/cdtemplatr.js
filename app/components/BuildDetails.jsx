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
          {"filename": "\\no\\such\\file.xml"},
          {"filename": "\\there\\are\\no\\files\\here.html"}
        ],
        "deletions": [
          {"filename": "\\deleted\\file\\here.exe.jpg"}
        ]
      }
    };
  },
  additionRowClicked: function(index) {
    this.state.cdtemplate.additions[index].selected = !this.state.cdtemplate.additions[index].selected;
    this.setState(this.state);
  },
  deletionRowClicked: function(index) {
    this.state.cdtemplate.deletions[index].selected = !this.state.cdtemplate.deletions[index].selected;
    this.setState(this.state);
  },
  approveChangesClicked: function() {
    var additions = (
      this.state.cdtemplate.additions
        .map((row, index) => ({row:row, index: index}))
        .filter(t=>t.row.selected)
        .map(t=>t.index)
      );
    var deletions = (
        this.state.cdtemplate.deletions
          .map((row, index) => ({row:row, index: index}))
          .filter(t=>t.row.selected)
          .map(t=>t.index)
        );
    $.ajax({
      url: this.props.url + "/approve/" + this.state.id,
      type: 'get',
      contentType: 'application/json',
      data: {
        additions: additions,
        deletions: deletions
      },
      dataType: 'json',
      success: function (data) {
        toastr.success(data, "Success!");
        this.loadFromServer(this.state.id);
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
        this.state.cdtemplate &&
        this.state.cdtemplate.additions.concat(this.state.cdtemplate.deletions).filter(t=>t.selected).length > 0
      );
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
              <div>
                <ArtefactsTable
                    rows={this.state.cdtemplate.additions}
                    heading="Files added to build"
                    onRowClicked={this.additionRowClicked} />
                </div>
              <div>
                <ArtefactsTable
                    rows={this.state.cdtemplate.deletions}
                    heading="Files removed from build"
                    onRowClicked={this.deletionRowClicked} />
              </div>
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
      url: this.props.url + "/details/" + id,
      dataType: 'json',
      cache: false,
      success: function (data) {
        if (data.cdtemplate) {
          data.cdtemplate.additions = data.cdtemplate.additions.map(filename=>({filename: filename}));
          data.cdtemplate.deletions = data.cdtemplate.deletions.map(filename=>({filename: filename}));
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
