var React = require("react");
var ReactDOM = require("react-dom");

var BuildList = require("./components/BuildList.jsx");
var BuildDetails = require("./components/BuildDetails.jsx");

var ArtefactsTable = require("./components/ArtefactsTable.jsx")
var ApproveChangesButton = require("./components/ApproveChangesButton.jsx")

function render() {
  ReactDOM.render(<BuildList url="/api/builds"/>, document.getElementById("buildListContainer"));
  ReactDOM.render(<BuildDetails url="/api/builds"/>, document.getElementById("buildDetailsContainer"));
}

render();
