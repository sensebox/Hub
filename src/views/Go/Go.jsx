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
            input:'5a30ea5375a96c000f012fe0',
            json:[],
            loading:true,
        }
        this.handleInput = this.handleInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleStats = this.handleStats.bind(this);
    }
    handleInput(e){
        this.setState({
            input:e.target.value
        })
        
    }
    handleSubmit(){       
        let url = 'https://api.opensensemap.org/boxes/'+this.state.input;
        fetch(url)      // Fetching Data about the senseBox
        .catch((error)=>{
            console.warn(error)
            return null
        })
        .then((response)=>response.json())
        .then((json)=>this.setState({
            senseBoxData:json,
            sensors:json.sensors
                    }))
        .then(()=>{
        this.state.sensors.map((sensor)=>{
            this.handleStats(sensor._id,sensor.title);
        })})
        .then(()=>this.setState({loading:false}))
    }

    handleStats(sensorid,title){
        let url = 'https://api.opensensemap.org/boxes/'+this.state.senseBoxData.id+'/data/'+sensorid;
        fetch(url)
        .catch((error)=>{
            console.warn(error)
            return null
        })
        .then((response)=>response.json())
        .then((json)=>this.setState((prevState)=>{
            json:prevState.json.push({typ:title,data:json})
        })
        
        );        

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
        { this.state.loading ?             
            <Button bsStyle="success" onClick={this.handleSubmit}>Lade Daten</Button>
                :
            <Link to={{pathname:`/senseBox`,query: {
                title:"senseboxData",
                content:this.state.senseBoxData,
                comments:this.state.json
            }}}>
                <Button bsStyle="success">Weiter</Button>
            </Link>}
            
            </Col>

            </Row>

        </Grid>
        )
    }


}
export default Go