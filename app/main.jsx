var React = require("react");
var ReactDOM = require("react-dom");

var BuildList = require("./components/BuildList.jsx");
var BuildDetails = require("./components/BuildDetails.jsx");

var ArtefactsTable = require("./components/ArtefactsTable.jsx")
var ApproveChangesButton = require("./components/ApproveChangesButton.jsx")

function render() {
  ReactDOM.render(<BuildList url="/api/builds"/>, document.getElementById("buildListContainer"));
  ReactDOM.render(<BuildDetails url="/api/builds"/>, document.getElementById("buildDetailsContainer"));
/*
  ReactDOM.render(<ArtefactsTable url="/api/newArtefacts" tableHeading="New artefacts in CD"/>, document.getElementById("newArtefactsContainer"));
  ReactDOM.render(<ArtefactsTable url="/api/removedArtefacts" tableHeading ="Artefacts removed from CD"/>, document.getElementById("removedArtefactsContainer"));
  ReactDOM.render(, document.getElementById("approveChangesContainer"));
  */
}

render();
