var React = require("react");
var ReactDOM = require("react-dom");

var SampleGrid = require("./components/SampleGrid.jsx");

function render() {
    ReactDOM.render(<SampleGrid />, document.getElementById("container"));
}

render();
