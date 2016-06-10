var React = require("react");

module.exports = React.createClass({
  getInitialState: function() {
    return {builds: [{name: "Loading..."}]};
  },
  render: function() {
    var rows = this.state.builds.map(function (build) {
        return (
          <tr key={build.key}>
            <td>{build.name}</td>
          </tr>
        );
    });
    return (
      <table className="table table-striped table-hover">
        <thead><tr>
          <th>Build</th>
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
