import React, { Component } from "react";
import { Grid } from "react-bootstrap";

class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <Grid fluid>
          <nav className="pull-left">
            <ul>
              <li>
                <a href="https://www.sensebox.de">senseBox:Website</a>
              </li>
              <li>
                <a href="https://sensebox.github.io/books-v2/edu/de/">senseBox:Books</a>
              </li>
              <li>
                <a href="https://twitter.com/sensebox_de">senseBox:Twitter</a>
              </li>
              <li>
                <a href="https://www.facebook.com/sensebox.de">senseBox:Kontakt</a>
              </li>
            </ul>
          </nav>
          <p className="copyright pull-right">
            &copy; {new Date().getFullYear()}{" "}
            <a href="http://www.creative-tim.com">Creative Tim</a>, made with
            love for a better web edited by senseBox
          </p>
        </Grid>
      </footer>
    );
  }
}

export default Footer;
