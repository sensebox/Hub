import React, { Component } from "react";
import { Grid, Row, Col, Button, FormControl } from "react-bootstrap";
import {Link} from 'react-router-dom'


class ErrorPage extends Component{
    constructor(props){
        super(props)
        this.state={

        }
    }
    render(){
        return(
        <Grid fluid>
            <h1>There has been an Error!</h1>
            <Col md={12}> 
                Please try again! <Link to='/dashboard'>Click here to go back!</Link>
            </Col>
        </Grid>
        )
    }
}

export default ErrorPage