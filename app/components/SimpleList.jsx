var React = require("react");

module.exports = React.createClass({
  getInitialState: function() {
    return {builds: [{name: "Loading..."}]};
  },
  render: function() {
    var rows = this.state.builds.map(function (build) {
        return <div><span>{build.name}</span></div>;
    });
    return <div>{rows}</div>;
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({builds: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }
});
