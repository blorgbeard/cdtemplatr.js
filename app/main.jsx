var React = require("react");
var ReactDOM = require("react-dom");

var BuildList = require("./components/BuildList.jsx");

var ArtefactsTable = require("./components/ArtefactsTable.jsx")

function render() {
  ReactDOM.render(<BuildList url="/api/builds"/>, document.getElementById("buildListContainer"));
  ReactDOM.render(<ArtefactsTable url="/api/newArtefacts" tableHeading="New artefacts in CD"/>, document.getElementById("newArtefactsContainer"));
  ReactDOM.render(<ArtefactsTable url="/api/removedArtefacts" tableHeading ="Artefacts removed from CD"/>, document.getElementById("removedArtefactsContainer"));
}

render();
