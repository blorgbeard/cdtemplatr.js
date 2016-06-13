var React = require("react");

module.exports = React.createClass({
  render: function(){
    return (
      <button type="button" className="btn btn-primary btn-lg" id="ApproveChangesButton" onClick={this.buttonClicked}>
        Approve changes
      </button>
    );
  },
  buttonClicked: function(){
    alert("Clicked")
  }
});
