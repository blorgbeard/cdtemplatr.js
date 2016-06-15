var React = require("react");

module.exports = React.createClass({
  render: function(){
    return (
      <button type="button" className="btn btn-primary btn-lg"
              id="ApproveChangesButton" onClick={this.buttonClicked}
              disabled={this.props.enabled ? "" : "disabled"}>
        Approve changes
      </button>
    );
  },
  buttonClicked: function(){
    var selectedRows = document.getElementsByClassName('selectedRow');
    if (!selectedRows) {
      alert("No changes selected");
      return;
    }

    var rowIds = [];
    for(var i = 0; i < selectedRows.length; i++){
      var row = selectedRows[i];
      rowIds.push(row.id);
    }
    alert("Change rows IDs to check in: " + rowIds);
  }
});
