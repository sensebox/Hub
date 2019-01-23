import React, { Component } from "react";
import { NavItem, Nav, NavDropdown, MenuItem } from "react-bootstrap";

class HeaderLinks extends Component {
  render() {
    console.log(this.props)
    var link1,link2
    if(this.props.id){
     link1 = "https://eboard.netlify.com/?id=" + this.props.id;
     link2 = "https://www.opensensemap.org/explore/" + this.props.id;
    }
    else {
     link1 =" https://eboard.netlify.com/"
     link2 = "https://www.opensensemap.org"

    }
    return (
      <div>
        <Nav>
          <NavItem eventKey={1} href="#">
          <p className="hidden-lg hidden-md">Name</p>

            <i className="fa fa-dashboard" />
          </NavItem>
        </Nav>
        <Nav pullRight>
          <NavItem eventKey={3} href={link2}>
            Go to openSenseMap
          </NavItem>
          <NavItem eventKey={4} href={link1} >
           Go to live dashboard
          </NavItem>
        </Nav>
      </div>
    );
  }
}

export default HeaderLinks;
