var React = require("react");
var ReactDOM = require("react-dom");

var SimpleList = require("./components/SimpleList.jsx");

function render() {
  ReactDOM.render(<SimpleList url="/api/builds"/>, document.getElementById("container"));
}

render();
