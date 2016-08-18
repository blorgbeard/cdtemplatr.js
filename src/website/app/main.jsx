var React = require("react");
var ReactDOM = require("react-dom");

var Router = require('react-router').Router
var Route = require('react-router').Route

var browserHistory = require('react-router').browserHistory;

var Main = require("./components/Main.jsx"); 

function render() { 
  ReactDOM.render(
    <Router history={browserHistory}>
      <Route path="/" component={Main} url="/api/builds"/>      
      <Route path="/build/:id" component={Main} url="/api/builds" tfs="___GULP_WILL_REPLACE_WITH_TFS_BASE_URL___"/>
    </Router>,
    document.getElementById("mainContainer")
  );
}

render();
