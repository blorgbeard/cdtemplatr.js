var React = require("react");

module.exports = React.createClass({
  render: function() {
    var rows = this.props.builds.map(function (build) {
        return <div><span>{build.name}</span></div>;
    });
    return <div>{rows}</div>;
  }
});
