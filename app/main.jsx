var React = require("react");
var ReactDOM = require("react-dom");

var BuildList = require("./components/BuildList.jsx");

var NewArtefactsTable = require("./components/NewArtefactsTable.jsx")

var RemovedArtefactsTable = React.createClass({
  render: function(){
    return (
      <table className="table table-hover">
        <thead><tr>
          <th>Artefacts removed from CD</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    )
  }
})

function render() {
  ReactDOM.render(<BuildList url="/api/builds"/>, document.getElementById("buildListContainer"));
  ReactDOM.render(<NewArtefactsTable url="/api/newArtefacts" pollInterval={5000}/>, document.getElementById("newArtefactsContainer"));
  ReactDOM.render(<RemovedArtefactsTable url="/api/builds" pollInterval={5000}/>, document.getElementById("removedArtefactsContainer"));
}

render();
