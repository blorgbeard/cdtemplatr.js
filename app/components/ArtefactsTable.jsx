var React = require("react");

module.exports = ArtefactsTable = React.createClass({
  getInitialState: function() {
    return {newArtefacts: [{name: "Select a Product above"}]};
  },
  rowClicked: function(e){
    var row = e.target.parentNode;
    if (row.selected){
      row.selected = false;
      row.className = '';
    } else {
      row.selected = true;
      row.className = 'selectedRow';
    }
  },
  render: function() {
    var rows = this.state.newArtefacts.map(function (newArtefact) {
      return (
        <tr key={newArtefact.key} id={newArtefact.key} onClick={this.rowClicked}>
          <td>{newArtefact.name}</td>
        </tr>
      )}.bind(this)
    );
    var tableHeading = this.props.tableHeading
    return (
      <table className="table table-hover ArtefactsTable">
        <thead><tr>
            <th>{tableHeading}</th>
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
