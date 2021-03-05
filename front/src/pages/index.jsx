import React from 'react'
import { Link } from 'react-router-dom'

export const Home = () => {
  return <div>
    <ul>
      <li><Link to="/" >Home</Link></li>
      <li><Link to="/prebuilds" >Prebuild</Link></li>
      <li><Link to="/customs" >Custom</Link></li>
      <li><Link to="/customs/subscripiton" >Custom Subscription</Link></li>
    </ul>
  </div>
}
