var React = require("react");

var BuildList = require("./BuildList.jsx");
var BuildDetails = require("./BuildDetails.jsx");

module.exports = Main = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  rowClicked: function(id) {
    this.context.router.push(`/build/${id}`);
  },
  render: function() {
    return (() => (
      <div className="row">
        <div id="buildListContainer" className="col-md-4">
          <BuildList url={this.props.route.url} rowClicked={this.rowClicked} id={this.props.params.id}/>
        </div>
        <div className="col-md-8">
        {(this.props.params.id) 
          ? <BuildDetails url={this.props.route.url} tfs={this.props.route.tfs} id={this.props.params.id}/>
          : <div><h1>Welcome</h1><p>Please select a build on the left!</p></div>
        }</div>
      </div>
    )).bind(this)();
  }
});