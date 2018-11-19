import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import 'assets/sass/custom.css'
import {Checkbox} from 'react-icheck';
import {Redirect} from 'react-router-dom'
import {LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,Legend,CartesianAxis} from 'recharts'
import Radio from 'components/CustomRadio/CustomRadio'
import data from 'variables/data.jsx'
import * as senseboxdata from "variables/sensebox.json"
var moment = require('moment')

class TestOffline extends Component {
    constructor(props){
        super()
        this.state={
            input:'5a30ea5375a96c000f012fe0',
            json:data[0],
            data:[],
            sensebox:senseboxdata,
            loading:false,
            selected:["Temperatur","Luftdruck"]
        }
        this.handleValues=this.handleValues.bind(this)
        this.handleRadio = this.handleRadio.bind(this)
        this.handleRadio2 = this.handleRadio2.bind(this)

    }
    componentDidMount(){

        this.handleValues();
    }

    handleSubmit(){       
        this.state.sensors.map((sensor)=>{            
            this.handleStats(sensor._id,sensor.title);
        })
    }

    handleStats(sensorid,title){
        let url = 'https://api.opensensemap.org/boxes/5a30ea5375a96c000f012fe0/data/'+sensorid;
        fetch(url)
        .catch((error)=>{
            console.warn(error)
            return null
        })
        .then((response)=>response.json())
        .then((json)=>this.setState((prevState)=>{
            data:prevState.data.push({typ:title,data:json})
        })
       );       
    }
    cutArray(steps,oldArr){
        var arr = [];
        for(var i=0;i<oldArr.length;i=i+steps){      
          arr.push(oldArr[i])
        }
        return arr;
    
      }
    // Functions that processes data 
    // is to be called after the data got requested
    handleValues(){
        // Calling variables to use in the algorithm
        const data = this.state.json;
        var arr = [];
        // Creating labels for the sets 
        // important: all arrays must be same size or are not allowed to be bigger than the first array => TODO 
        data[0].data.map((measurement)=>{
            let label = moment(measurement.createdAt).format("DD.MM.YYYY HH:mm")   ;
            arr.push({Zeitpunkt:label})

                   })
        // Pushing all values into one array
        // arr[0]data["Temperatur"]=22.88
        for(var i = 0;i<data.length;i++){
            for(var u = 0;u<data[i].data.length;u++){
                arr[u][data[i].typ]=parseFloat(data[i].data[u].value);
            }
        }
        arr = arr.reverse();
        // Set state to the new calculated array 
        this.setState({
            data:arr
        })
    }
    // handlers for the 2 radio button groups
    handleRadio(e){
        const id = e.target.dataset.title
        const selected = this.state.selected
        this.setState({
            selected:[id,selected[1]]
        })
    }
    handleRadio2(e){        
        const id = e.target.dataset.title
        const selected = this.state.selected
        this.setState({
            selected:[selected[0],id]
        })
    }
    render(){
        if(this.state.loading){
            return(
                <p>Ja des</p>
            )        }
        if(!this.state.loading){      
        return(
            <Grid>
                <Row>
                    <button onClick={()=>this.handleValues()}>Des</button>
                    <Col lg={3} md={6}>
                    <ul>
                        {this.state.sensebox.sensors.map((sensor)=>{
                            return(
                        <li key={sensor._id}>
                        <Radio
                                label={sensor.title}
                                key={sensor._id}
                                name="sensoren1"
                                onChange={this.handleRadio}
                                number={sensor.title} 
                                data-title={sensor.title}
                                />
                      </li>
                        )})}
                    </ul>
                    </Col>
                    <Col lg={3} md={6}>
                    <ul>
                        {this.state.sensebox.sensors.map((sensor)=>{
                            return(
                        <li key={sensor._id}>
                        <Radio
                                label={sensor.title}
                                key={sensor._id}
                                name="sensoren2"
                                onChange={this.handleRadio2}
                                number={sensor.title+"2"}
                                data-title = {sensor.title}
                            />
                      </li>
                        )})}
                    </ul>
                    </Col>
                    
                </Row>
                <Row>
                <LineChart width={1000} height={500} data={this.state.data}>
                      <CartesianGrid stroke="#ccc" />
                      <YAxis yAxisId={0} />
                      <YAxis yAxisId={1} orientation="right"/>
                      <XAxis dataKey="Zeitpunkt"/>
                      <Line yAxisId={0} type="monotone" dataKey={this.state.selected[0]} stroke="#8884d8"/>
                      <Line yAxisId={1} type="monotone" dataKey={this.state.selected[1]} stroke="#4EAF47"/>
                      <Tooltip/>
                      <Legend/>
                    </LineChart>
                    </Row>
            </Grid>
        )
    }else{
        return(
            <Grid>
                <Row>Warte</Row>
            </Grid>
        )
    }

    }
}

export default TestOffline