import React from "react";
import { BrowseRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./pages/index";
import Checkout from "./pages/prebuilds/index";
import Custom from "./pages/customs/index";
import CustomSubscription from "./pages/customs/Subscription";
import "./App.css";

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route path="/prebuilds">
            <Checkout />
          </Route>
          <Route path="/customs">
            <Custom />
          </Route>
          <Route path="/customs/subscription">
            <CustomSubscription />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
