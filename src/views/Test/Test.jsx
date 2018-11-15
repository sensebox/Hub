import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import 'assets/sass/custom.css'
import {Checkbox, Radio} from 'react-icheck';
import {Redirect} from 'react-router-dom'
import {LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,Legend,CartesianAxis} from 'recharts'
var moment = require('moment')

class Test extends Component {
    constructor(props){
        super()
        this.state={
            input:'5a30ea5375a96c000f012fe0',
            data:[],
            loading:true,
        }
        this.handleValues=this.handleValues.bind(this)
        this.processReChart=this.processReChart.bind(this)
    }
    componentDidMount(){
        this.handleSubmit()
    }

    handleSubmit(){       
        let url = 'https://api.opensensemap.org/boxes/5a30ea5375a96c000f012fe0'
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

    handleValues(){
        // const data = this.state.data;
        // var obj = new Array(); // Array that holds 
        // for(var i=0;i<data.length;i++){
        //     for(var u=0;u<data[i].data.length;u++){
        //         const measurement = data[i].data[u]; // measurement.value for the actual value 
        //         if(i==0){
        //             var arr = new Array(measurement.value);
        //             obj.push(arr)
        //         }
        //         else{
        //             obj[u].push(measurement.value)
        //         }
        //     }
        // }
        // obj = this.cutArray(100,obj);
        // console.log(obj);
        // this.processReChart(obj)
        const data = this.state.data;
        var obj = {Zeitpunkt:"22.12"};
        console.log(data)
    }

        /* Beispielobjekt bei 6 Sensoren :
        {Zeitpunkt:"22.12",Temperatur:12,Luftfeuchte:99,Luftdruck:1000,UV:220,PM10:5,PM25:2,Beleuchtung:6000}
        Objekt wird erstellt mit den 
    */
    processReChart(arr){
        
    }

    render(){
        if(!this.state.loading){            
        return(
            <Grid>
                <Row>
                    <button onClick={()=>this.handleValues()}>Des</button>
                </Row>
                <Row>
                <LineChart width={1000} height={500} data={this.state.data}>
                      <CartesianGrid stroke="#ccc" />
                      <YAxis yAxisId={0} />
                      <YAxis yAxisId={1} orientation="right"/>
                      <XAxis dataKey="Zeitpunkt"/>
                      <Line yAxisId={0} type="monotone" dataKey="Wert1" stroke="#8884d8"/>
                      <Line yAxisId={1} type="monotone" dataKey="Wert2" stroke="#4EAF47"/>
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

export default Test