var React = require("react");
var events = require("../events.js");

function BreakifyPath(text) {
  // insert a (breaking) zero-width space before every slash
  return text.replace(/([/\\])/g, "\u200B$1");
}

var ArtefactRow = React.createClass({
  handleMouseDown: function(e) {
    this.props.onMouseDown(this.props.index, e.shiftKey);
    return false;
  },
  handleMouseOver: function() {
    this.props.onMouseOver(this.props.index);
  },  
  render: function() {
    return function() {
      let icon = this.props.row.xml.startsWith('<file')
        ? "glyphicon glyphicon-file"
        : this.props.row.xml.startsWith("</dir")
          ? "glyphicon glyphicon-folder-close"
          : "glyphicon glyphicon-folder-open";

      let indent = this.props.row.indent * 10;

      return (
        <tr className={this.props.row.selected ? "selectedRow" : ""}
             onMouseDown={this.handleMouseDown}
             onMouseOver={this.handleMouseOver}>
          <td colSpan={this.props.colSpan || 1}>                    
            <span className={icon} style={{float: "left", paddingLeft: indent + "px"}} />              
            <span style={{display: "block", paddingLeft: (indent + 20) + "px"}}>{BreakifyPath(this.props.row.xml)}</span>
          </td>
        </tr>
      );
    }.bind(this)();
  }
});

var ArtefactsTable;
module.exports = ArtefactsTable = React.createClass({
  dragValue: false,
  isDragging: false,
  minDragIndex: 0,
  maxDragIndex: 0,
  lastToggledIndex: -1,
  rowMouseDown: function(index, shiftKey) {
    this.isDragging = true;
    this.minDragIndex = (shiftKey && this.lastToggledIndex >= 0) ? Math.min(this.lastToggledIndex, index) : index;
    this.maxDragIndex = (shiftKey && this.lastToggledIndex >= 0) ? Math.max(this.lastToggledIndex, index) : index;
    this.lastToggledIndex = index;
    this.dragValue = !(this.props.rows[index].selected);
    this.props.setSelection(this.dragValue, this.minDragIndex, this.maxDragIndex);
  },
  rowMouseOver: function(index) {
    if (this.isDragging) {
      this.minDragIndex = Math.min(index, this.minDragIndex);
      this.maxDragIndex = Math.max(index, this.maxDragIndex);
      this.lastToggledIndex = index;
      this.props.setSelection(this.dragValue, this.minDragIndex, this.maxDragIndex);
    }
  },
  selectAll: function() {
    this.props.setSelection(true, 0, this.props.rows.length-1);
  },
  selectNone: function() {
    this.props.setSelection(false, 0, this.props.rows.length-1);
  },
  render: function() {
    var rows = this.props.rows.map(function(row, index) {
      return (
        <ArtefactRow
          key={index} index={index} row={row} colSpan={2}
          onMouseDown={this.rowMouseDown}
          onMouseOver={this.rowMouseOver} />
      );
    }.bind(this));
    return (
      <table className="noselect table table-hover ArtefactsTable">
        <thead><tr>
            <th>{this.props.heading}</th>
            <th style={{textAlign: "right"}}>
              <button type="button" className="btn btn-default btn-xs" onClick={this.selectAll}>
                Select All
              </button>
              &nbsp;
              <button type="button" className="btn btn-default btn-xs" onClick={this.selectNone}>
                Select None
              </button>
            </th>
        </tr></thead>
        <tbody>{rows}</tbody>
      </table>
    );
  },
  componentDidMount: function() {
    $(document).mouseup(function () {
      this.isDragging = false;
    }.bind(this));
  }
});
