import React, { Component } from "react";
import { Grid, Row, Col ,Panel} from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import 'assets/sass/custom.css'
import {Redirect} from 'react-router-dom'
import Radio from 'components/CustomRadio/CustomRadio'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Collapsible from 'react-collapsible';

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
    console.log(props) 
    this.state={
      data:[], // Array that contains the data that is visualized in the graph 
      selected:["Loading...",""],
      checkboxChecked:false,
      graph_data:[],
      hasError:false,
      selectedSensors:[],
      toggle:false,
      loading:true,
      loaded:true,
      json:[],
      panel1:"glyphicon glyphicon-chevron-up",
    }
    this.handleRadio = this.handleRadio.bind(this);
    this.addSeries = this.addSeries.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStats = this.handleStats.bind(this)
    this.handlePanel1 = this.handlePanel1.bind(this);
  } 
  componentDidMount(){
    this.handleSubmit(this.addSeries)
  }
  componentDidUpdate(){

  }

  handleSubmit(){  
    let url = 'https://api.opensensemap.org/boxes/'+this.props.match.params.id;
    fetch(url)      // Fetching Data about the senseBox
    .catch((error)=>{
        console.warn(error)
        return null
    })
    .then((response)=>response.json())
    .then((json)=>this.setState({
        senseBox:json,
        sensors:json.sensors
                }))
    .then(()=>{
      this.state.sensors.map((sensor)=>{
        this.handleStats(sensor._id,sensor.title);
    })})
    .then(()=>{
      this.setState(
        {loading:false
      })
    })
}

handleStats(sensorid,title){
    let url = 'https://api.opensensemap.org/boxes/'+this.props.match.params.id+'/data/'+sensorid;
    fetch(url)
    .catch((error)=>{
        console.warn(error)
        return null
    })
    .then((response)=>response.json())
    .then((json)=>this.setState((prevState)=>{
        json:prevState.json.push({typ:title,data:json})
    },function(){
      if(this.state.length===2)this.setState({selected:[this.state.json[0].title,this.state.json[1].title]})
      if(this.state.json.length === this.state.sensors.length)this.addSeries()

    }))

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

  addSeries() {
    // init Variables 
    let chart = this.myRef.current.chart
    const data = this.state.json;
    var arr = [];
    var dateArray = []
    for(let i = 0 ;i<data.length;i++){
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
    for(let i=0;i<2;i++){
        var opposite = false;
        if(i === 1 ) opposite = true
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
        range:"Von "+dateArray[0]+" bis "+dateArray[dateArray.length-1],
        loaded:false
    })
    chart.axes[1].remove()
    
  }


  handleRadio(e){   
    let chart = this.myRef.current.chart
    const phenomenon =e.target.dataset.title
    var newPheno = this.state.data_new.filter((sensor)=>{
        return(sensor.typ === phenomenon)
    })
    if(this.state.selected[0] === phenomenon || this.state.selected[1] === phenomenon) return null
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
    handlePanel1(){
      var newClass = "" 
      if(this.state.panel1==="glyphicon glyphicon-chevron-up") newClass = "glyphicon glyphicon-chevron-down"
      else newClass = "glyphicon glyphicon-chevron-up"
      this.setState({panel1:newClass})
  }

  render() {
    if(this.state.hasError){
      return <Redirect to="/dashboard"/>
    }
    if(!this.state.loading){
    return (
      <Grid fluid>
        <Row>
          <Col md ={12}>
          <Panel className="des" bsStyle="success">
            <Collapsible open={true} trigger={
                <div onClick={this.handlePanel1} className="panel-heading"> 					
                <h3 className="panel-title clickable collaps-title">Live measurements</h3>
                 <span className="pull-right clickable"><i className={this.state.panel1}></i></span></div>}>
           <div className="panel-body">
           {this.state.sensors.map((sensor)=>(
            <Col key={sensor._id} lg={3} md={6}>
             <StatsCard             
              bigIcon={
                <div className="radio_group">

            </div>}
                statsIconText="Updated just now" statsText={sensor.title} statsValue={sensor.lastMeasurement.value+" "+sensor.unit}/>
            </Col>
          ))}  </div>
          </Collapsible>
          </Panel>
          </Col>
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
                            category="Click phenomenon to add to graph"
                            content={
                                <ul>
                                {
                                    this.state.sensors.map((sensor)=>{
                                      if(sensor.title === this.state.selected[0] || sensor.title === this.state.selected[1]) return null
                                    else
                                    return (
                                    <li className="sensors" key={sensor._id}>
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
    )};// end if loading  
    if(this.state.loading){
        return(
          
            <div className="spinner center-screen">
            <div className="des">
            <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={this.myRef}
          /> </div>
          </div>
          
        )
    }
  }
}

export default Dashboard;
