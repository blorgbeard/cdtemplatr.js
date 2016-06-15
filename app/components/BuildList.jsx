var React = require("react");
var events = require("../events.js");

var BuildListRow = React.createClass({
  handleClick: function() {
    this.props.onRowClicked(this.props.build.key);
  },
  render: function() {
    var result = function() {
      return (
        <tr ref="row" onClick={this.handleClick}>
          <td>
            <span>{this.props.build.name}</span>
            &nbsp;
            <span className="text-muted">{this.props.build.branch}</span>
          </td>
          <td>{this.props.build.cdtemplate ? <span className="glyphicon glyphicon-alert text-danger"/> : ""}</td>
        </tr>
      );
    }.bind(this);
    return result();
  },
});

module.exports = BuildList = React.createClass({
  getInitialState: function() {
    return {builds: []};
  },
  rowClicked: function (id) {
    // todo: colour the row and decolour the others
    console.log("user clicked build " + id);
    events.raise('buildSelected', id);
  },
  render: function() {
    var rows = this.state.builds.map(function (build) {
        return (
          <BuildListRow key={build.key} build={build} onRowClicked={this.rowClicked} />
        );
    }.bind(this));
    return (
      <table className="table table-striped table-hover">
        <thead><tr>
          <th>Build</th>
          <th/>
          <th/>
        </tr></thead>
        <tbody>{rows}</tbody>
      </table>
    );
  },
  loadFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({builds: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadFromServer();
    if (this.props.pollInterval) {
      setInterval(this.loadFromServer, this.props.pollInterval);
    }
  }
});
