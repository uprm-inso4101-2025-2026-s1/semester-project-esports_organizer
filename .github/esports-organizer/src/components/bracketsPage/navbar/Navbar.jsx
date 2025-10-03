
import React, { useState } from 'react';
import './Navbar.css';
import NavButton from "./NavButton";

function Navbar(){
  const [activeIndex, setActiveIndex] = useState(0);
  const navItems = ["Home", "Tournaments", "Teams", "Community"];

  return (
    <div className="container">
      <div className="nav-left">
        <img src="" alt="" className="logo" />
        <ul>
          {navItems.map((item, idx) => (
            <li key={item}>
              <NavButton
                text={item}
                active={activeIndex === idx}
                onClick={() => setActiveIndex(idx)}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="nav-right">
        <NavButton text="Login / Sign Up" active={false} />
      </div>
    </div>
  );
}

export default Navbar