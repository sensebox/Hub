import React, { Component } from "react";
import { Grid, Row, Col, Button } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import 'assets/sass/custom.css'
import {Redirect} from 'react-router-dom'
import Radio from 'components/CustomRadio/CustomRadio'
import {data} from 'variables/data.jsx'
import ReactHighcharts from 'react-highcharts'

var moment = require('moment')
var config = {
    chart: {
        defaultSeriesType: 'spline'
    },
    series: [],
    yAxis:[],
    title:{
        text:"Messwerte senseBox"
    }
  };
class Test extends Component {
    constructor(props){
        super()
        this.state={
            input:'5bb610bf043f3f001b6a4c53',
            data:[],
            loading:true,
            selected:["Temperatur","Luftdruck"]
        }
        this.handleValues=this.handleValues.bind(this)
        this.handleRadio = this.handleRadio.bind(this)
        this.handleRadio2 = this.handleRadio2.bind(this)
        this.addSeries = this.addSeries.bind(this)
        this.cutArray = this.cutArray.bind(this)
    }
    componentDidMount(){
        this.handleSubmit()
       
    }

    handleSubmit(){       
        let url = 'https://api.opensensemap.org/boxes/5bb610bf043f3f001b6a4c53'
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
        let url = 'https://api.opensensemap.org/boxes/5bb610bf043f3f001b6a4c53/data/'+sensorid;
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
        const data = this.state.data;
        var arr = [];
        console.log(data)
        // Creating labels for the sets
        data[0].data.map((measurement)=>{
            let label = moment(measurement.createdAt).format("DD.MM.YYYY HH:mm")   ;
            arr.push({Zeitpunkt:label})

                   })
        // Pushing all values into one array
        for(var i = 0;i<data.length;i++){
            for(var u = 0;u<data[i].data.length;u++){
                arr[u][data[i].typ]=parseFloat(data[i].data[u].value);
            }
        }
        this.setState({
            data:this.cutArray(20,arr)
        })
        
        console.log(arr)
    }

    /*
        data : [{typ:'Luft',data:[2,3,4,53,235]},{...}]
        access with data[i].data
    */
    addSeries(){
        // init Variables 
        let chart = this.refs.chart.getChart()
        const data = this.state.data;
        var arr = [];
        var dateArray = []
        for(var i = 0 ;i<data.length;i++){
            var newArr = {typ:data[i].typ,data:[]}
            for(var u = 0;u<data[i].data.length;u++){
                newArr.data.push(parseFloat(data[i].data[u].value))
            }
            arr.push(newArr)
        }
        // Create xAxis with moment
        data[0].data.map((measurement)=>{
            dateArray.push(moment(measurement.createdAt).format("DD.MM.YYYY HH:mm"))
        })
        arr.push(dateArray)
        // Add xAxis
        chart.xAxis[0].update({categories:arr[arr.length-1]},true)
        // Loop first 2 entries and display in graph 
        for(var i=0;i<2;i++){
            var opposite = false;
            if(i%2 == 0 ) opposite = true
            chart.addAxis({
                id:data[i].typ,
                title:{
                    text:data[i].typ
                },
                opposite:opposite
            })
            chart.addSeries({
                name:data[i].typ,
                type:"spline",
                data:arr[i].data,
                yAxis:data[i].typ
            })
        }

        // List all phenomena and make it able to select them to add to the graph 
        // Make it possible to remove certain phenomena
        console.log(chart.getSelectedSeries())
    }
    handleRadio(e){
        const id = e.target.id
        const selected = this.state.selected
        this.setState({
            selected:[id,selected[1]]
        })
    }
    handleRadio2(e){
        const id = e.target.id
        const selected = this.state.selected
        this.setState({
            selected:[selected[0],id]
        })
    }
    render(){
        if(!this.state.loading){      
            console.log(this.state.sensors)      
        return(
            <Grid fluid>
                <Row>
                <Col md={10}>
                    <Card 
                        title="Des"
                        category="Live Measurement"
                        stats="Listening for new data"
                        statsIcon="pe-7s-video"
                        content={
                            <ReactHighcharts  config={config} height={600}  ref="chart"></ReactHighcharts>
                        }
                        />
                </Col> 
                <Row>
                <Col md={2}>
                        <Card 
                            title="Sensor to choose"
                            category="All Phenomena from your Box"
                            content=
                            {<ul>{this.state.sensors.map((sensor)=>{
                            return <li>{sensor.title}</li>
                        })}</ul> }/>
                </Col>
                <Col md={2}>
                        <Card 
                            title="Sensor to choose"
                            category="All Phenomena from your Box"
                            content=
                            {<div>
                                <Button bsStyle='success' onClick={()=>this.addSeries()}>Load data to Graph</Button>
                            </div>
                            }/>
                </Col>
                </Row>
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