var React = require("react");

module.exports = NewArtefactsTable = React.createClass({
  getInitialState: function() {
    return {newArtefacts: [{name: "Select a Product above"}]};
  },
  render: function() {
    var rows = this.state.newArtefacts.map(function (newArtefact) {
        return (
          <tr key={newArtefact.key}>
            <td>{newArtefact.name}</td>
          </tr>
        );
    });
    return (
      <table className="table table-hover">
        <thead><tr>
            <th>New artefacts in CD</th>
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
        this.setState({newArtefacts: data});
      }.bind(this),
      error: function (xhr, status, err) {
        //console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadFromServer();
    setInterval(this.loadFromServer, 10000000);
  }
});
