var React = require("react");
var events = require("../events.js");

var applyFilter = require("../utils/filter/filter").apply;

var BuildListRow = React.createClass({
  handleClick: function() {
    this.props.onRowClicked(this.props.build.id);    
  },
  getHtmlBuildName: function(build) {
    return {__html: this.props.build.filterHighlightedFriendlyName || this.props.build.friendlyName};
  },
  getHtmlBuildBranch: function(build) {
    return {__html: this.props.build.filterHighlightedBranch || this.props.build.branch};
  },
  render: function() {
    var result = function() {
      return (
        <tr ref="row" className={this.props.selected ? "selectedRow" : ""} onClick={this.handleClick}>
          <td>
            <span dangerouslySetInnerHTML={this.getHtmlBuildName(this.props.build)}></span>
            &nbsp;
            <span className="text-muted" dangerouslySetInnerHTML={this.getHtmlBuildBranch(this.props.build)}></span>
          </td>
          <td className="noselect" style={{textAlign: "right"}}>
            {this.props.build.cdtemplate 
              ? <span className="glyphicon glyphicon-alert text-danger"/> 
              : ""}
          </td>
        </tr>
      );
    }.bind(this);
    return result();
  },
});

module.exports = BuildList = React.createClass({
  getInitialState: function() {
    return {
      showOnlyFailed: true,
      filter: "",
      builds: []
    };
  },  
  updateShowOnlyFailed: function() {
    this.setState({
      showOnlyFailed: this.refs.showOnlyFailed.checked,
      filter: this.state.filter
    });
  },
  updateFilter: function() {
    const filter = this.refs.filter.value;
    const builds = this.applyFilterToBuilds(filter, this.state.builds);
    this.setState({
      showOnlyFailed: this.state.showOnlyFailed,
      filter: filter,
      builds: builds
    });
  },  
  applyFilterToBuilds: function(filter, builds) {
    if (!filter) {
      return builds.map(build => {
        build.filterMatched = true;
        build.filterHighlightedFriendlyName = build.friendlyName;
        build.filterHighlightedBranch = build.branch;
        return build;
      });
    }
    return builds.map(build => {
      var match = applyFilter(filter, [build.friendlyName, build.branch]);
      if (!match) {
        build.filterMatched = false;
        build.filterHighlightedFriendlyName = build.friendlyName;
        build.filterHighlightedBranch = build.branch;
        return build;        
      }
      var resultToHtml = result => result.map(chunk => {
        if (chunk.text != undefined) return chunk.text;
        if (chunk.match != undefined) return `<b>${chunk.match}</b>`;
        throw Error("Invalid result; can't parse.");
      }).join('');
      build.filterMatched = true;
      build.filterHighlightedFriendlyName = resultToHtml(match[0]);
      build.filterHighlightedBranch = resultToHtml(match[1]);
      return build;
    });
  },
  getVisibleBuilds: function() {
    return this.state.builds.filter(b => 
      (
        (!this.state.showOnlyFailed || b.hasChanges) 
      ) && (
        (!this.state.filter || b.filterMatched)
      )      
    );
  },
  render: function() {
    var rows = this.getVisibleBuilds().map(function (build) {
        return (
          <BuildListRow key={build.id} build={build} onRowClicked={this.props.rowClicked} selected={(build.id == this.props.id)} />
        );
    }.bind(this));
    return (
      <div>        
        <table className="table table-striped table-hover build-list-header-table">
          <thead><tr>
            <th>Builds</th>
            
          </tr></thead>
        </table>
        <div className="build-list-table">
          <table className="table table-striped table-hover">
            <thead><tr>
              <th>
                <input type="textbox" ref="filter"
                       placeholder="Type to filter" 
                       style={{verticalAlign: "text-bottom"}}
                       value={this.state.filter} 
                       onChange={this.updateFilter} />
              </th>
              <th style={{textAlign: "right"}}>
                <input type="checkbox" ref="showOnlyFailed" value="showOnlyFailed"
                      value={this.state.showOnlyFailed}
                      onChange={this.updateShowOnlyFailed}/>
              </th>
            </tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
    );
  },  
  componentDidMount: function() {
    $(this.refs.showOnlyFailed).bootstrapToggle({
      on: 'Failed Only',
      off: 'All Builds',
      size: 'mini',
      width: 100
    });
    $(this.refs.showOnlyFailed).change(this.updateShowOnlyFailed);    
  },
  componentWillReceiveProps: function(newProps) {
    var newBuildIsBroken = newProps.builds.filter(t=>t.id == newProps.id)[0].hasChanges;
    var newShowOnlyFailed = this.state.showOnlyFailed && newBuildIsBroken;
    //this.refs.showOnlyFailed.checked = newShowOnlyFailed;    
    this.setState({
      showOnlyFailed: newShowOnlyFailed,
      filter: this.state.filter,
      builds: newProps.builds
    });
  }
});
