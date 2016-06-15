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
            <span>{this.props.build.name}</span>
            &nbsp;
            <span className="text-muted">{this.props.build.branch}</span>
          </td>
          <td style={{textAlign: "right"}}>{this.props.build.cdtemplate ? <span className="glyphicon glyphicon-alert text-danger"/> : ""}</td>
        </tr>
      );
    }.bind(this);
    return result();
  },
});

module.exports = BuildList = React.createClass({
  getInitialState: function() {
    return {
      idSelected: 0,
      filtered: true,
      builds: []
    };
  },
  rowClicked: function (id) {
    // todo: colour the row and decolour the others
    console.log("user clicked build " + id);
    this.setState({
      idSelected: id,
      filtered: this.state.filtered,
      builds: this.state.builds
    });
    events.raise('buildSelected', id);
  },
  toggleFilter: function() {
    console.log("toggleFilter");
    this.setState({
      idSelected: this.state.idSelected,
      filtered: !this.state.filtered,
      builds: this.state.builds
    });
  },
  render: function() {
    var rows = this.state.builds.filter(b => !this.state.filtered || b.cdtemplate).map(function (build) {
        return (
          <BuildListRow key={build.id} build={build} onRowClicked={this.rowClicked} selected={build.id == this.state.idSelected} />
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
  loadFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({
          idSelected: this.state.idSelected,
          filtered: this.state.filtered,
          builds: data
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    $(this.refs.toggleFilter).bootstrapToggle({
      on: 'Failed Only',
      off: 'All Builds',
      size: 'mini',
      width: 100
    });
    $(this.refs.toggleFilter).change(this.toggleFilter);
    this.loadFromServer();
    if (this.props.pollInterval) {
      setInterval(this.loadFromServer, this.props.pollInterval);
    }
  }
});
