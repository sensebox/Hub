import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import 'assets/sass/custom.css'
import {Redirect} from 'react-router-dom'
import Radio from 'components/CustomRadio/CustomRadio'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

const options = {
  title: {
    text: ''
  }
}


var moment = require('moment')
class Dashboard extends Component {
  constructor(props){
    super(props)
    this.myRef = React.createRef();   
    this.state={
      data:[], // Array that contains the data that is visualized in the graph 
      selected:["Temperatur","Luftdruck"],
      checkboxChecked:false,
      graph_data:[],
      senseBox:props.location.query.content,
      json : props.location.query.comments,
      hasError:false,
      selectedSensors:[],
      toggle:true
    }
    this.handleRadio = this.handleRadio.bind(this);
    this.addSeries = this.addSeries.bind(this);
  }
  componentDidMount(){
    this.addSeries();
  }
  componentDidUpdate(){

  }
  cutArray(steps,oldArr){
    var arr = [];
    for(var i=0;i<oldArr.length;i=i+steps){      
      arr.push(oldArr[i])
    }
    return arr;

  }

  componentDidCatch(error, info){
    this.setState({ has_error: true });
  }

  addSeries(){
    // init Variables 
    let chart = this.myRef.current.chart
    const data = this.state.json;
    var arr = [];
    var dateArray = []
    for(var i = 0 ;i<data.length;i++){
        var newArr = {typ:data[i].typ,data:[]}
        for(var u = data[i].data.length-1;u>=0;u--){
            newArr.data.push(parseFloat(data[i].data[u].value))
        }
        arr.push(newArr)
    }
    chart.setTitle({
      text:this.state.senseBox.name
    })
    // Create xAxis with moment
    data[0].data.map((measurement)=>{
        dateArray.push(moment(measurement.createdAt).format("DD.MM.YYYY HH:mm"))
    })
    arr.push(dateArray.reverse())
    // Add xAxis
    
    chart.xAxis[0].remove()
    chart.addAxis({
        tickInterval:280,
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
        selected:[data[0].typ,data[1].typ],
        range:"Von "+dateArray[0]+" bis "+dateArray[dateArray.length-1]
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

  render() {
    if(this.state.hasError){
      return <Redirect to="/dashboard"/>
    }
    return (
      <div className="content">
        <Grid fluid>
        <Row>
           {this.state.senseBox.sensors.map((sensor)=>(
            <Col key={sensor._id} lg={3} md={6}>
             <StatsCard             
              bigIcon={
                <div className="radio_group">

            </div>}
                statsIconText="Updated just now" statsText={sensor.title} statsValue={sensor.lastMeasurement.value+" "+sensor.unit}/>
            </Col>
          ))}  
          </Row>
          <Row>
            <Col md={10}>
            <Card
                statsIcon="fa fa-history"
                id="chartHours"
                title={this.state.selected[0] +"/" + this.state.selected[1]}
                category={this.state.range}
                stats="Updated 1 minute ago"
                content={
                  <HighchartsReact
                  highcharts={Highcharts}
                  options={options}
                  ref={this.myRef}
                /> 
                }
                />
            </Col>
            <Col md={2}>
                        <Card 
                            title="Sensor to choose"
                            category="All Phenomena from your Box"
                            content={
                                <ul>
                                {
                                    this.state.senseBox.sensors.map((sensor)=>{
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
                       }/>
                </Col>

          </Row>
        </Grid>
      </div>
    );
  }
}

export default Dashboard;
