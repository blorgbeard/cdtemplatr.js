var React = require("react");

var BuildList = require("./BuildList.jsx");
var BuildDetails = require("./BuildDetails.jsx");

const apiUrl = "/api/builds";

module.exports = Main = React.createClass({
  getInitialState: function() {
    return {
      // todo: filled out serverside?
      builds: []
    };
  },
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  rowClicked: function(id) {
    this.context.router.push(`/build/${id}`);
  },
  render: function() {
    return (() => (
      <div className="row">
        <div id="buildListContainer" className="col-md-3 col-sm-4">
          <BuildList builds={this.state.builds} rowClicked={this.rowClicked} id={this.state.id}/>
        </div>
        <div className="col-md-9 col-sm-8">
        {(this.state.id) 
          ? <BuildDetails url={apiUrl} tfs={this.props.route.tfs} id={this.state.id}/>
          : <div><h1>Welcome</h1><p>Please select a build on the left!</p></div>
        }</div>
      </div>
    )).bind(this)();
  },
  updateState: function(builds, params) {
    let id = params.id;
    if (!id && params.name) {
      // translate build name to id
      const matched = builds.filter(t => t.name === params.name);
      if (matched.length > 0) {
        id = matched[0].id;
      }
    }
    this.setState({
      builds: builds,
      id: id 
    });
  },
  loadList: function(url) {
    $.ajax({
      url: url,
      dataType: 'json',
      cache: false    
    }).then(data => {
      this.updateState(data, this.props.params);
    });
  },
  componentDidMount: function() {
    this.loadList(apiUrl, this.props.params);
  },
  componentWillReceiveProps: function(nextProps) {
    this.updateState(this.state.builds, nextProps.params);
  }
});