import React, { Component } from "react";
import { Grid, Row, Col, Button, FormControl } from "react-bootstrap";
import {Link,Route} from 'react-router-dom'
import Dashboard from 'views/Dashboard/Dashboard'
import img from 'assets/img/banner.jpg'
import 'assets/sass/custom.css'
var moment = require('moment')

class Go extends Component {
    constructor(props){
        super()
        this.state={
            input:'5bb610bf043f3f001b6a4c53',
            json:[],
            loading:true,
        }
        this.handleInput = this.handleInput.bind(this);
    
    }
    handleInput(e){
        this.setState({
            input:e.target.value
        })
        
    }


  
    render(){
        return(
        <Grid fluid>
            <img alt="senseBoxGo" className="image_header_go" src={img}></img>
            <Row style={{'marginLeft':0}}>
                <h1>Welcome to the Dashboard<br></br>
                    <small>Please enter your senseBox-ID</small>
                </h1>
            </Row>
            <Row>
            <Col md={6}>   
            <FormControl
            type="text"
            placeholder="senseBoxID"
            onChange={this.handleInput}
            />
            </Col>
            <Col md={6}> 
            <Link to={`/sensebox/${ this.state.input }`}>           

            <Button bsStyle="success" onClick={this.handleSubmit}>Load senseBox</Button>
            </Link>
            </Col>

            </Row>

        </Grid>
        )
    }


}
export default Go