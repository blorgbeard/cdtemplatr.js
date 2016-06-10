var React = require("react");

module.exports = React.createClass({
  getInitialState: function() {
    return {builds: [{name: "Loading..."}]};
  },
  render: function() {
    var rows = this.state.builds.map(function (build) {
        return (
          <tr key={build.key}>
            <td>{build.key}</td>
            <td>{build.name}</td>
            <td>{build.tag}</td>
          </tr>
        );
    });
    return (
      <table>
        <thead><tr>
          <th>Number</th>
          <th>Name</th>
          <th>Tag</th>
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
    setInterval(this.loadFromServer, this.props.pollInterval);
  }
});
