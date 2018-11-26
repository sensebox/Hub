import React, { Component } from "react";
import { Grid, Row, Col, Button } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import 'assets/sass/custom.css'
import {Redirect} from 'react-router-dom'
import Radio from 'components/CustomRadio/CustomRadio'
import {data} from 'variables/data.jsx'
import {Collapse} from 'react-collapse'
import { render } from 'react-dom'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


var moment = require('moment')
const options = {
    title: {
      text: 'senseBox measurements'
    }
  }
class Test extends Component {
    constructor(props){
        super(props)
        this.myRef = React.createRef();
        this.state={
            input:'5bb610bf043f3f001b6a4c53',
            data:[],
            loading:true,
            selected:["Temperatur","Luftdruck"],
            toggle:false
        }
        this.handleValues=this.handleValues.bind(this)
        this.handleRadio = this.handleRadio.bind(this)
        this.addSeries = this.addSeries.bind(this)
        this.cutArray = this.cutArray.bind(this)
    }
    componentDidMount(){
        this.handleSubmit()
       
    }

    handleSubmit(){       
        let url = 'https://api.opensensemap.org/boxes/5bb610bf043f3f001b6a4c53'
        fetch(url)      // Fetching Datsa about the senseBox
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


    addSeries(){
        // init Variables 
        let chart = this.myRef.current.chart
        const data = this.state.data;
        var arr = [];
        var dateArray = []
        for(var i = 0 ;i<data.length;i++){
            var newArr = {typ:data[i].typ,data:[]}
            for(var u = data[i].data.length-1;u>=0;u--){
                newArr.data.push(parseFloat(data[i].data[u].value))
            }
            arr.push(newArr)
        }
        // Create xAxis with moment
        data[0].data.map((measurement)=>{
            dateArray.push(moment(measurement.createdAt).format("DD.MM.YYYY HH:mm"))
        })
        arr.push(dateArray.reverse())
        // Add xAxis
        
        chart.xAxis[0].remove()
        chart.addAxis({
            categories:arr[arr.length-1]
        },true)
        // Loop first 2 entries and display in graph 
        for(var i=0;i<2;i++){
            var opposite = false;
            if(i == 1 ) opposite = true
            chart.addAxis({
                id:data[i].typ+"axis",
                title:{
                    text:data[i].typ
                },
                opposite:opposite
            })
            chart.addSeries({
                name:data[i].typ,
                type:"spline",
                data:arr[i].data,
                yAxis:data[i].typ+"axis"
            })
        }
        this.setState({
            data_new:arr,
            selected:[data[0].typ,data[1].typ]
        })
        chart.axes[1].remove()
        
    }
    handleRadio(e){
        let chart = this.myRef.current.chart
        const phenomenon =e.target.dataset.title
        var newPheno = this.state.data_new.filter((sensor)=>{
            return(sensor.typ === phenomenon)
        })

        // Remove previous ( first ) series 
        var toremoveaxis = chart.yAxis.filter((axis)=>{
            return(axis.axisTitle.textStr === this.state.selected[1])
        })
        chart.series[0].remove(false)
        chart.get(this.state.selected[0]+"axis").remove()
        var newSeries = {
            name:newPheno[0].typ,
            type:'spline',
            data:newPheno[0].data,
            yAxis: newPheno[0].typ+"axis"
        }
        var newAxis = {
            id:newPheno[0].typ+"axis",
            title:{
                text:newPheno[0].typ
            },
            opposite:this.state.toggle
        }

        // Add Series and new axis
         chart.addAxis(newAxis)
         chart.addSeries(newSeries)

        var selected = this.state.selected
        var newSelected = [selected[1],phenomenon]
        this.setState({
            selected:newSelected,
            toggle:!this.state.toggle,
        })
    }
    
    render(){
        if(!this.state.loading){      
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
                            <HighchartsReact
                            highcharts={Highcharts}
                            options={options}
                            ref={this.myRef}
                          />                        }
                        />
                </Col> 
                <Row>
                <Col md={2}>
                        <Card 
                            title="Sensor to choose"
                            category="All Phenomena from your Box"
                            content={
                            <Collapse isOpened={true}>
                                <ul>
                                {
                                    this.state.sensors.map((sensor)=>{
                                    return (
                                    <li key={sensor._id}>
                                        <Radio
                                            number={sensor._id}
                                            name="radio"
                                            onChange={this.handleRadio}
                                            label={sensor.title}
                                            data-title = {sensor.title}

                                        />
                                    </li>)
                            })
                            }
                            </ul> 
                        </Collapse>}/>
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