import React, { Component } from "react";
import { NavItem, Nav, NavDropdown, MenuItem } from "react-bootstrap";

class HeaderLinks extends Component {
  render() {
    return (
      <div>
        <Nav>
          <NavItem eventKey={1} href="#">
          <p className="hidden-lg hidden-md">Name</p>

            <i className="fa fa-dashboard" />
          </NavItem>
        </Nav>
        <Nav pullRight>
          <NavItem eventKey={3} href="www.opensensemap.org">
            Go to openSenseMap
          </NavItem>
        </Nav>
      </div>
    );
  }
}

export default HeaderLinks;
