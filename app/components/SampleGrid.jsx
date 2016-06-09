var React = require("react");
var DataGrid = require("react-datagrid");

var data = [
  {id: 1, name: "PointOfSale", status:"OK"},
  {id: 2, name: "Cinema", status:"SNAFU"},
  {id: 3, name: "HeadOffice", status:"OK"},
  {id: 4, name: "FilmProgramming", status:"32 additions / 3 deletions"},
];

var columns = [
  {name: "name"},
  {name: "status"}
];

module.exports = React.createClass({
  render: function() {
    return (
      <DataGrid idProperty="id" columns={columns} dataSource={data} />
    );
  }
});
