var React = require("react");
var events = require("../events.js");

module.exports = ArtefactsTable = React.createClass({
  getInitialState: function() {
    return {rows: ["Select a Product above"]};
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
    var rows = this.props.rows.map(function (newArtefact) {
      return (
        <tr key={newArtefact.key} id={newArtefact.key} onClick={this.rowClicked}>
          <td>{newArtefact}</td>
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
  componentDidMount: function() {

  }
});
