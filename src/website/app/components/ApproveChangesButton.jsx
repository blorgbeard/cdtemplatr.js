var React = require("react");
var SkyLight = require("react-skylight").default;
var Spinner = require('react-spinkit');

function formatChanges(additionCount, deletionCount) {
  let list = [];
  if (additionCount > 0) {
    list.push(`${additionCount} new file${additionCount===1?"":"s"}`);
  }
  if (deletionCount > 0) {
    list.push(`${deletionCount} deleted file${deletionCount===1?"":"s"}`);
  }
  return list.join(", ");
}

var ApproveChangesButton;
module.exports = ApproveChangesButton = React.createClass({
  getInitialState: function() {
    return {};
  },
  render: function(){
    return function() {
      let changeCount = this.props.additionCount + this.props.deletionCount;
      let disabled = changeCount > 0 ? "" : "disabled";
      let buttonText = (changeCount == 0) 
        ? "Approve changes" 
        : (changeCount == 1)
          ? "Approve 1 change" 
          : `Approve ${changeCount} changes`;
      let dialogStyle = {
        transition: "opacity 0.25s, transform 0.25s"
      };
      let overlayStyle = {
        backgroundColor: "#000000",
        opacity: 0.75,
        transition: "opacity 0.25s"
      };
      return (
        <div id="ApproveChangesContainer">
          <section>
            <button type="button" className="btn btn-primary btn-lg"
                    id="ApproveChangesButton" onClick={this.buttonClicked}
                    disabled={disabled}>
              {buttonText}
            </button>
          </section>
          <SkyLight 
            ref="confirmDialog" title={`Approve changes to ${this.props.build.friendlyName}`} 
            dialogStyles={dialogStyle} overlayStyles={overlayStyle}             
            afterOpen={this.dialogEntrance} beforeClose={this.dialogExit}>
            <div>
              <p>
                <span>{this.props.build.friendlyName} </span>
                <span className="text-muted">{this.props.build.branch} </span>
                <span>&mdash; </span>
                <span>approving {formatChanges(this.props.additionCount, this.props.deletionCount)}.</span>
              </p>
              <p/>
              <p>Commit message:</p>
              <div className="commit-message-container">
                <p className="text-muted">CDTEMPLATE:</p>
                <input id="commit-message" ref="commitMessage" className="disable-while-committing" type="textbox" defaultValue="Approving changes"/>
              </div>
            </div>
            <div className="btn-group">
              <span id="commit-spinner" style={{display: "none"}}>
                <span style={{display: "inline-block", position: "relative", top: "23px"}}>
                  <Spinner spinnerName="chasing-dots" noFadeIn />                
                </span>
                <span id="commit-status">Please wait..</span>
              </span>
              <span>
                <button type="button" className="btn btn-primary disable-while-committing" onClick={this.confirmClicked}>Commit</button>
                <button type="button" className="btn btn-default disable-while-committing" onClick={()=>this.refs.confirmDialog.hide()}>Cancel</button>
              </span>
            </div>
          </SkyLight>
          <SkyLight ref="errorDialog" title="Something happened ¯\_(ツ)_/¯">
            <p className="bg-danger" style={{padding: "15px", marginTop: "35px"}}>
              Some kind of error occurred. Sorry about that. Please reload the page and try again.
            </p>
            <div className="btn-group">
              <button type="button" className="btn btn-default" onClick={()=>this.refs.errorDialog.hide()}>Ok, I will.</button>
             </div>
          </SkyLight>
        </div>
      );
    }.bind(this)();
  },
  dialogEntrance: function() {
    $("#ApproveChangesContainer .skylight-dialog").css({"opacity": 0, transform: "scale(0.5)"});
    $("#ApproveChangesContainer .skylight-overlay").css({"opacity": 0});
    window.setTimeout(() => {
      $("#ApproveChangesContainer .skylight-dialog").css({"opacity": 1, transform: "scale(1)"});
      $("#ApproveChangesContainer .skylight-overlay").css("opacity", 0.75);
    });    
  },
  dialogExit: function() {
    // todo: this doesn't work because it doesn't wait until the animation has finished before exiting.
    // instead, have the exit button call a function that does this and closes the dialog when the animation finishes.
    $("#ApproveChangesContainer .skylight-dialog").css({"opacity": 0, transform: "scale(0.5)"});
    $("#ApproveChangesContainer .skylight-overlay").css({"opacity": 0});
  },
  buttonClicked: function() {    
    this.refs.confirmDialog.show();
  },
  confirmClicked: function() {
    $(".disable-while-committing").prop("disabled", true);
    $(".skylight-close-button").hide();
    $("#commit-spinner").show();
    this.props.commitChanges("CDTEMPLATE: " + this.refs.commitMessage.value, function(status){
      $("#commit-status").text(status);
    }).then(result => {
      $(".disable-while-committing").prop("disabled", false);
      $(".skylight-close-button").show();
      $("#commit-spinner").hide();
      this.refs.confirmDialog.hide();
      if (result.error) {
        console.error(result);
        this.refs.errorDialog.show();
      }
      // todo: signal refresh?    
    });
  }
});
