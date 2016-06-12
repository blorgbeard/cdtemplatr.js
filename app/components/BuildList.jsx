var React = require("react");

module.exports = BuildList = React.createClass({
  getInitialState: function() {
    return {builds: [{name: "Loading..."}]};
  },
  render: function() {
    var rows = this.state.builds.map(function (build) {
        return (
          <tr key={build.key}>
            <td><span>{build.name}</span> <span className="text-muted">{build.branch}</span></td>
            <td>{build.cdtemplate ? <span className="glyphicon glyphicon-alert text-danger"/> : ""}</td>
          </tr>
        );
    });
    return (
      <table className="table table-striped table-hover">
        <thead><tr>
          <th>Build</th>
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
