import React from 'react'
import { Link } from "react-router-dom";

const Nav = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/prebuilds">Prebuild</Link>
        </li>
        <li>
          <Link to="/customs">Custom</Link>
        </li>
        <li>
          <Link to="/customs/subscription">Custom Subscription</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav
