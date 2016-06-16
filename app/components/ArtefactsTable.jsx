var React = require("react");
var events = require("../events.js");

var ArtefactRow = React.createClass({
  handleClick: function() {
    this.props.onRowClicked(this.props.index);
  },
  render: function() {
    return function(){
      return (
        <tr className={this.props.row.selected ? "selectedRow" : ""} onClick={this.handleClick}>
          <td>{this.props.row.filename}</td>
        </tr>
      );
    }.bind(this)();
  }
});

module.exports = ArtefactsTable = React.createClass({
  rowClicked: function(key){
    this.props.onRowClicked(key);
  },
  render: function() {
    var rows = this.props.rows.map(function(row, index) {
      return (
        <ArtefactRow key={index} index={index} onRowClicked={this.rowClicked} row={row}/>
      );
    }.bind(this));
    return (
      <table className="table table-hover ArtefactsTable">
        <thead><tr>
            <th>{this.props.heading}</th>
        </tr></thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
});
