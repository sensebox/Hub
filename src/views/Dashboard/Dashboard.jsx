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
      hasError:false,
      selectedSensors:["Temperatur","Luftdruck"]
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

  componentDidCatch(error, info){
    this.setState({ has_error: true });
  }
  addToGraph(title){
    var values = this.handleValues();
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
    const selected = this.state.selectedSensors
    this.setState({
        selected:[selected[0],id]
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
                <Radio
                label={sensor.title}
                key={sensor._id}
                name="sensoren1"
                onChange={this.handleRadio}
                number={sensor.title}
                data-title = {sensor.title}
            />
            <Radio
            label={sensor.title}
            key={sensor._id+"e"}
            name="sensoren2"
            onChange={this.handleRadio2}
            number={sensor.title+"2"}
            data-title = {sensor.title}
            /></div>}
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
                    <LineChart width={1500} height={500} data={this.state.json}>
                      <CartesianGrid stroke="#ccc" />
                      <YAxis yAxisId={0} />
                      <YAxis yAxisId={1} orientation="right"/>

                      <XAxis dataKey="Zeitpunkt"/>
                      <Line yAxisId={0} type="monotone" dataKey={this.state.selectedSensors[0]} stroke="#8884d8"/>
                      <Line yAxisId={1} type="monotone" dataKey={this.state.selectedSensors[1]} stroke="#4EAF47"/>

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
