import React, { Component } from "react";
import ChartistGraph from "react-chartist";
import { Grid, Row, Col } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import 'assets/sass/custom.css'
import {Checkbox, Radio} from 'react-icheck';
import {Redirect} from 'react-router-dom'
import {LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,Legend,CartesianAxis} from 'recharts'




var moment = require('moment')
class Dashboard extends Component {
  constructor(props){
    super()   
    this.state={
      data:[], // Array that contains the data that is visualized in the graph 
      selected:"Select Sensor",
      checkboxChecked:false,
      senseBox:props.location.query.content,
      json : props.location.query.comments,
      hasError:false
    }
    this.handleIsItChecked = this.handleIsItChecked.bind(this);
  }
  createLegend(json) {
    var legend = [];
    for (var i = 0; i < json["names"].length; i++) {
      var type = "fa fa-circle text-" + json["types"][i];
      legend.push(<i className={type} key={i} />);
      legend.push(" ");
      legend.push(json["names"][i]);
    }
    return legend;
  }
  componentDidMount(){
    
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

  handleJson(title){ // Function which processes the measurement json and extracts only the values 
    var filtered = this.state.json.filter((sensor)=>{ // Gives the Measurements which correspond to the checkbox clicked
      return sensor.typ != "placeholder";
    })
    var filtered2 = this.state.json.filter((sensor)=>{
      return sensor.typ=='Beleuchtungsstärke';
    })
    
    var values = []; // Variable needed for storing
    const selected = this.state.selected
    filtered.data.map((measurement)=>{ 
      let label = moment(measurement.createdAt).format("DD.MM.YYYY HH:mm")   ;
      let value = parseFloat(measurement.value);
      // Takes the measurements and extracts only the values
      values.push({Zeitpunkt:label,Wert:value});
   })

   var i = 0;
   var newState = []
   values.map((tick)=>{

    newState.push({Zeitpunkt:tick.Zeitpunkt,Wert1:tick.Wert,Wert2:parseFloat(filtered2[0].data[i].value)})
     i +=1;
    })
    
   values = newState.reverse();
   return values
  }

  // Not used .. 
  addLabels(){
    //         
    var labels = []
    this.state.json[1].data.map((measurement)=>{
      let label = moment(measurement.createdAt).format("MMM Do YY");
      labels.push(label)
    })
    labels = this.cutArray(20,labels)
    return labels
  }

  removeActiveBoxes(){
    const checkedBoxes = document.getElementsByClassName("checked")
    if(checkedBoxes.length>0){
      for(var i = 0 ; i<checkedBoxes.length;i++){
        checkedBoxes[i].classList.remove("checked")
          }
    }
  }
  componentDidCatch(error, info){
    this.setState({ has_error: true });
  }
  addToGraph(title){
    var values = this.handleJson(title);
    values = this.cutArray(20,values);
    this.setState({
      data:values,
      range:"Von " + values[0].Zeitpunkt +" bis " + values[values.length-1].Zeitpunkt
    })
  }

  // Function that is called whenever a checkbox is clicked 
  handleIsItChecked(e) {
    this.removeActiveBoxes();
    const isActive = e.target.checked; // Variable that holds whether the checkbox is selected 
    const title = e.target.id ; // Variable that holds which Sensor to load 
    if(isActive){ // when clicked checkbox is active now => i.e. is selected
      this.setState({
        selected:title,
      })
      // Create Array to push 
      // For visualization purposes only every 20nd value is displayed
      
      this.addToGraph(title);
    }  
    else{
      this.setState({
        data:{series:[]},selected:"Please Select a sensor",range:"Select a sensor"
      })
    }
    
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
                <Checkbox
                    id={sensor.title}
                    onClick={this.handleIsItChecked}
                    checkboxClass="icheckbox_square-green"
                    increaseArea="20%"
                    label="Show"
                    />}
                statsIconText="Updated just now" statsText={sensor.title} statsValue={sensor.lastMeasurement.value+" "+sensor.unit}/>
            </Col>
          ))}  
          </Row>
          <Row>
            <Col md={12}>
            <Card
                statsIcon="fa fa-history"
                id="chartHours"
                title={this.state.selected}
                category={this.state.range}
                stats="Updated 1 minute ago"
                content={
                    <LineChart width={1500} height={500} data={this.state.data}>
                      <CartesianGrid stroke="#ccc" />
                      <YAxis yAxisId={0} />
                      <YAxis yAxisId={1} orientation="right"/>

                      <XAxis dataKey="Zeitpunkt"/>
                      <Line yAxisId={0} type="monotone" dataKey="Wert1" stroke="#8884d8"/>
                      <Line yAxisId={1} type="monotone" dataKey="Wert2" stroke="#4EAF47"/>

                      <Tooltip/>
                      <Legend/>
                    </LineChart>
                }
                />
            </Col>

          </Row>
        </Grid>
      </div>
    );
  }
}

export default Dashboard;
