var React = require("react");
var ReactDOM = require("react-dom");

var Router = require('react-router').Router
var Route = require('react-router').Route

var browserHistory = require('react-router').browserHistory;

var Main = require("./components/Main.jsx"); 

function render() { 
  const tfs = "___GULP_WILL_REPLACE_WITH_TFS_BASE_URL___";
  ReactDOM.render(
    <Router history={browserHistory}>
      <Route path="/" component={Main} />      
      <Route path="/build/:id" component={Main} tfs={tfs}/>
      <Route path="/build/named/:name" component={Main} tfs={tfs}/>
    </Router>,
    document.getElementById("mainContainer")
  );
}

render();
