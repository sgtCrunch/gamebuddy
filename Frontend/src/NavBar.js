import React from "react";
import "./NavBar.css";
import { NavLink } from "react-router-dom";
import { Navbar, Nav, NavItem } from "reactstrap";

function NavBar({user}) {


  if(Object.keys(user).length > 0) {
    const icon = JSON.parse(user.avatar).small;
    console.log(icon);
    return (
      <div>
        <Navbar expand="md">
          <NavLink exact to="/" className="navbar-brand">
            GameBuddy
          </NavLink>

          <Nav className="ml-auto" navbar>
            <NavItem>
              <NavLink to="/past-sessions">Past Sessions</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/profile">Profile</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/logout">Logout <img src={icon}/></NavLink>
            </NavItem>
          </Nav>
        </Navbar>
      </div>
    );
  }

  return (
    <div>
      <Navbar expand="md">
        <NavLink exact to="/" className="navbar-brand">
          GameBuddy
        </NavLink>

        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink to="/login">Login</NavLink>
          </NavItem>
        </Nav>
      </Navbar>
    </div>
  );
}

export default NavBar;
