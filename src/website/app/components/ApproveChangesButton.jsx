var React = require("react");

module.exports = ApproveChangesButton = React.createClass({
  render: function(){
    return (
      <button type="button" className="btn btn-primary btn-lg"
              id="ApproveChangesButton" onClick={this.buttonClicked}
              disabled={this.props.changeCount > 0 ? "" : "disabled"}>
        {(this.props.changeCount == 0) 
          ? "Approve changes"  
          : (this.props.changeCount == 1)
            ? "Approve 1 change" 
            : `Approve ${this.props.changeCount} changes` }
      </button>
    );
  },
  buttonClicked: function(){
    this.props.onClicked();
  }
});
