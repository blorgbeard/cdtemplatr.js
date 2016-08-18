var React = require("react");
var events = require("../events.js");

var BuildListRow = React.createClass({
  handleClick: function() {
    this.props.onRowClicked(this.props.build.id);    
  },
  render: function() {
    var result = function() {
      return (
        <tr ref="row" className={this.props.selected ? "selectedRow" : ""} onClick={this.handleClick}>
          <td>
            <span>{this.props.build.friendlyName}</span>
            &nbsp;
            <span className="text-muted">{this.props.build.branch}</span>
          </td>
          <td className="noselect" style={{textAlign: "right"}}>{this.props.build.cdtemplate ? <span className="glyphicon glyphicon-alert text-danger"/> : ""}</td>
        </tr>
      );
    }.bind(this);
    return result();
  },
});

module.exports = BuildList = React.createClass({
  getInitialState: function() {
    return {
      filtered: true,
    };
  },  
  toggleFilter: function() {
    this.setState({
      filtered: !this.state.filtered,
    });
  },
  render: function() {
    var rows = this.props.builds.filter(b => !this.state.filtered || b.hasChanges || b.id == this.props.id).map(function (build) {
        return (
          <BuildListRow key={build.id} build={build} onRowClicked={this.props.rowClicked} selected={(build.id == this.props.id)} />
        );
    }.bind(this));
    return (
      <div>
        <table className="table table-striped table-hover build-list-header-table">
          <thead><tr>
            <th>Build</th>
            <th style={{textAlign: "right"}}>
              <input type="checkbox" ref="toggleFilter" value="filtered"
                     checked={this.state.filtered}
                     onChange={this.toggleFilter}/>
            </th>
          </tr></thead>
        </table>
        <div className="build-list-table">
          <table className="table table-striped table-hover">
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
    );
  },  
  componentDidMount: function() {
    $(this.refs.toggleFilter).bootstrapToggle({
      on: 'Failed Only',
      off: 'All Builds',
      size: 'mini',
      width: 100
    });
    $(this.refs.toggleFilter).change(this.toggleFilter);        
  }
});
