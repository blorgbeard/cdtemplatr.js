var React = require("react");
var ReactDOM = require("react-dom");

var SampleGrid = require("./components/SampleGrid.jsx");

function render() {
  var data = [
    {id: 1, name: "PointOfSale", status:"OK"},
    {id: 2, name: "Cinema", status:"SNAFU"},
    {id: 3, name: "HeadOffice", status:"OK"},
    {id: 4, name: "FilmProgramming", status:"32 additions / 3 deletions"},
  ];
  ReactDOM.render(<SampleGrid builds={data}/>, document.getElementById("container"));
}

render();
