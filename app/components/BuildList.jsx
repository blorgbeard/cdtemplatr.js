var React = require("react");
var events = require("../events.js");

module.exports = BuildList = React.createClass({
  getInitialState: function() {
    return {builds: [{name: "Loading..."}]};
  },
  rowClicked: function (e) {
    alert('got click');
    var row = e.target.parentNode;
    if (row.selected){
      row.selected = false;
      row.className = '';
    } else {
      row.selected = true;
      row.className = 'selectedRow';
    }
    events.raise('buildSelected', e.target.parentNode["key"]);
  },
  render: function() {
    var rows = this.state.builds.map(function (build) {
        return (
          <tr key={build.key} onClick={this.rowClicked}>
            <td><span>{build.name}</span> <span className="text-muted">{build.branch}</span></td>
            <td>{build.cdtemplate ? <span className="glyphicon glyphicon-alert text-danger"/> : ""}</td>
          </tr>
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
