import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import 'assets/sass/custom.css'
import {Redirect} from 'react-router-dom'
import Radio from 'components/CustomRadio/CustomRadio'




var moment = require('moment')
class Dashboard extends Component {
  constructor(props){
    super()   
    this.state={
      data:[], // Array that contains the data that is visualized in the graph 
      selected:"Select Sensor",
      checkboxChecked:false,
      graph_data:[],
      senseBox:props.location.query.content,
      json : props.location.query.comments,
      hasError:false,
      selectedSensors:[]
    }
    this.handleRadio = this.handleRadio.bind(this);
    this.handleRadio2 = this.handleRadio2.bind(this);
    this.handleValues = this.handleValues.bind(this)
  }
  componentDidMount(){
    this.handleValues();
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

  handleValues(){
    // Calling variables to use in the algorithm
    var data = this.state.json;
    console.log(data)
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
    arr = arr.reverse()
    // Set state to the new calculated array 
    this.setState({
        graph_data:this.cutArray(5,arr),
        range:"Von " + arr[0].Zeitpunkt +" bis " + arr[arr.length-1].Zeitpunkt

    })
  }

  // handlers for the 2 radio button groups
  handleRadio(e){
    const id = e.target.dataset.title
    const selected = this.state.selectedSensors
    this.setState({
        selectedSensors:[id,selected[1]]
    })
  }
handleRadio2(e){        
    const id = e.target.dataset.title
    const selected = this.state.selectedSensors
    this.setState({
        selectedSensors:[selected[0],id]
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
                title={this.state.selectedSensors[0] +"/" + this.state.selectedSensors[1]}
                category={this.state.range}
                stats="Updated 1 minute ago"
                content={
                    <div>Stats here</div> 
                }
                />
            </Col>
            <Col md={2}>
                <ul>
                  {this.state.senseBox.sensors.map((sensor)=>{
                    return(
                      <li key ={sensor._id}> 
                          <Radio
                        label={sensor.title}
                        name="sensoren1"
                        onChange={this.handleRadio}
                        number={sensor.title}
                        data-title = {sensor.title}
                        />
                      </li>
                    )
                  })}
                </ul>
                <hr></hr>
                <ul>
                  {this.state.senseBox.sensors.map((sensor)=>{
                    return(
                      <li key={sensor._id +"e"}>
                      <Radio
                        label={sensor.title}
                        key={sensor._id+"e"}
                        name="sensoren2"
                        onChange={this.handleRadio2}
                        number={sensor.title+"2"}
                        data-title = {sensor.title}
                      />
                    </li>
                    )
                  })}
                </ul>
            </Col>

          </Row>
        </Grid>
      </div>
    );
  }
}

export default Dashboard;
