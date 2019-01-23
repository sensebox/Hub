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
import Button from 'components/CustomButton/CustomButton';
import {Link} from 'react-router-dom'
import ErrorPage from 'components/ErrorPage/ErrorPage'
import DatePicker from 'react-datepicker'
import {FormInputs} from 'components/FormInputs/FormInputs.jsx'
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';

const options = {
  title: {
    text: ''
  },
  loading: {
    labelStyle : {
        fontStyle:'roboto'
    },
    hideDuration: 1000,
    showDuration: 1000
},

}


var moment = require('moment')
class Dashboard extends Component {
  constructor(props){
    super(props)
    this.myRef = React.createRef();  
    this.state={
      data:[], // Array that contains the data that is visualized in the graph 
      selected:["Loading...",""],
      checkboxChecked:false,
      graph_data:[],
      hasError:false,
      selectedSensors:[],
      toggle:true,
      loading:true,
      loaded:true,
      json:[],
      panel1:"glyphicon glyphicon-chevron-up",
      from:"",
      to:"",
      loading_stats:true,


    }
    this.handleRadio = this.handleRadio.bind(this);
    this.addSeries = this.addSeries.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStats = this.handleStats.bind(this)
    this.handlePanel1 = this.handlePanel1.bind(this);
    this.onChangeFrom = this.onChangeFrom.bind(this);
    this.onChangeTo = this.onChangeTo.bind(this)
    this.submitStats = this.submitStats.bind(this);
  } 
  componentDidMount(){
    this.handleSubmit(this.addSeries)
  }
  componentDidUpdate(){

  }

  handleSubmit(){  
    let url = 'https://api.opensensemap.org/boxes/'+this.props.match.params.id;
    fetch(url)      // Fetching Data about the senseBox
    .then((response)=>{
        if(response.ok){
            return response.json()
        }
        this.setState({
            hasError:"network"
        })
        throw new Error('Network response was not ok');   
       
    })
    .then((json)=>this.setState({
        senseBox:json,
        sensors:json.sensors
                }))
    .then(()=>{
      this.state.sensors.map((sensor)=>{
        this.handleStats(sensor._id,sensor.title,false);
    })})
    .then(()=>{
      this.setState(
        {loading:false
      })
    })
    .catch(function(error){
        console.log('Error: ',error.message);
    })
}
handleStats2(sensorid,title,range){
    var url = "https://api.opensensemap.org/statistics/descriptive?boxId="+this.props.match.params.id+"&phenomenon="+
    title+"&from-date="+this.state.from+"&to-date="+this.state.to+"&operation=arithmeticMean"+"&window=300000&format=json";
    fetch(url)
    .catch((error)=>{
        console.warn(error)
        return null
    })
    .then((response)=>{
        if(response.ok)
            return response.json();
        this.setState({
            hasError:"no measurement"
        })
        throw new Error('Box has no measurements to fetch')
    })
    .then((json)=>{
        var dataArray = []
        for(var measurement in json[0]){
            if(measurement === "sensorId") continue 
            dataArray.push({value:json[0][measurement],createdAt:measurement})
        }
        dataArray = dataArray.reverse();
        let toPush = this.state.json;
        toPush.push({typ:title,data:dataArray})
        this.setState({
            json:toPush
        })
    })
    .then(()=>{
        if(this.state.json.length === this.state.sensors.length){
            this.addXAxis()
            this.addSeries(this.state.json[0].typ,true)
            this.addSeries(this.state.json[1].typ,false)
            this.setState(
                {selected:[this.state.json[0].typ,this.state.json[1].typ],
                    loading_stats:false}
                )
            this.myRef.current.chart.hideLoading()
        }
    })
    console.log(this.state.json)
    
}
handleStats(sensorid,title,range){
    let url = 'https://api.opensensemap.org/boxes/'+this.props.match.params.id+'/data/'+sensorid;
    if(range){
        url = "https://api.opensensemap.org/statistics/descriptive?boxId="+this.props.match.params.id+"&phenomenon="+
        title+"&from-date="+this.state.from+"&to-date="+this.state.to+"&operation=arithmeticMean"+"&window=300000";
    }
        fetch(url)
    .catch((error)=>{
        console.warn(error)
        return null
    })
    .then((response)=>{
        if(response.ok)
            return response.json()
        this.setState({
            hasError:"no measurement"
        })
        throw new Error('Box has no measurements to fetch')
    })
    .then((json)=>this.setState((prevState)=>{
        json:prevState.json.push({typ:title,data:json})
    },function(){
      if(this.state.json.length === this.state.sensors.length){
        this.addXAxis()
        this.addSeries(this.state.json[0].typ,true)
        this.addSeries(this.state.json[1].typ,false)
        this.setState(
            {selected:[this.state.json[0].typ,this.state.json[1].typ],
            loading_stats:false}
            )
    }
    }))
    .catch(function(error){
        console.log('Error: ',error.message);
    })
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
  /**
   * Returns an array that is derived from the senseBox data
   * this array holds all dates and can be used to 
   * create an xAxis for HighCharts
   */
  createXAxis(){
    var dateArray = []
    this.state.json[0].data.map((measurement)=>{
        dateArray.push(moment(measurement.createdAt).format("DD.MM.YYYY HH:mm"))
    })
    dateArray = dateArray.reverse()
    return dateArray
  }

  /**
   * Function that adds the xAxis after it was previously created
   */
  addXAxis(){
    var xAxis = this.createXAxis();
    let chart = this.myRef.current.chart
    chart.setTitle({
        text:this.state.senseBox.name
      })
    chart.xAxis[0].remove(); // make sure that only one xAxis exists at a time
    chart.addAxis({
        tickInterval:280,
        categories:xAxis
    },true)
    this.setState({
        range:"Von "+xAxis[0]+" bis "+xAxis[xAxis.length-1],
    })
  }
  /**
   * Returns an array that is derived from the senseBox data
   * this array holds all an object which contains all values 
   * from all sensors in a HighCharts compatible way
   * 
   * {typ:"Luftfeuchtigkeit",data:[2,3,4,...]}
   */
  createSeries(){
      var arr = []
      for(let i=0;i<this.state.json.length;i++){
          var newArr = {typ:this.state.json[i].typ,data:[]}
          for(let u=this.state.json[i].data.length-1;u>=0;u--){
              newArr.data.push(parseFloat(this.state.json[i].data[u].value))
          }
          arr.push(newArr)
      }
      return arr;
  }
  
  /**
   * Adds a given series to the visualization with the right axis
   * @param {*} title 
   * @param {*} opposite 
   */
  addSeries(title,opposite) {
    // init Variables 
    let chart = this.myRef.current.chart
    const data = this.state.json;
    var arr = this.createSeries();
    var toAdd = arr.filter((sensor)=>{
        return sensor.typ === title
    })

    chart.addAxis({
        id:title+"axis",
        title:{
            text:title
        },
        opposite:opposite
    })
    chart.addSeries({
        name:title,
        id:title,
        typ:"spline",
        data:toAdd[0].data,
        yAxis:title+"axis"
    })
    this.setState({
        data_new:arr,
        loaded:false
    })
  }
  removeSeries(title){
      let chart = this.myRef.current.chart
      chart.get(title).remove();
      chart.get(title+"axis").remove();
    
  }
  onChangeFrom(e){
    var newDate = e.target.value + "T00:00:00.032Z";
      this.setState({
          from:newDate 
      })
  }
  onChangeTo(e){
      var newDate = e.target.value + "T00:00:00.032Z";
      this.setState({
          to:newDate
      })
  }
  submitStats(){
    let chart = this.myRef.current.chart
    chart.showLoading();

    this.removeSeries(this.state.selected[0])
    this.removeSeries(this.state.selected[1])
    this.setState({
        json:[]
    },function(){
      this.state.sensors.map((sensor)=>{
        this.handleStats2(sensor._id,sensor.title,true)
    })  
    })
    
  }
  handleRadio(e){   
    const phenomenon =e.target.dataset.title
    // Abort 
    if(this.state.selected[0] === phenomenon || this.state.selected[1] === phenomenon) return null
    // Remove previous ( first ) series 
    this.removeSeries(this.state.selected[0]);
    this.addSeries(phenomenon,this.state.toggle);

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
      return( 
          <ErrorPage/>
          ) 
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
                statsIconText={sensor.lastMeasurement.createdAt} statsText={sensor.title} statsValue={sensor.lastMeasurement.value+" "+sensor.unit}/>
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
                /> }/>
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
                <Col md={2}>
                       <Card 
                            title="Choose a date"
                            category="Select time frame for the statistics"
                            content={
                            <Grid fluid>
                              <FormInputs
                                ncols={["col-md-6","col-md-6","col-md-12"]}
                                proprieties = {[
                                    {
                                        label:"From",
                                        id:"from",
                                        type:"date",
                                        bsClass:"form-control",
                                        defaultValue:this.state.from,
                                        onChange:this.onChangeFrom
                                    },
                                    {
                                        label:"To",
                                        id:"to",
                                        type:"date",
                                        bsClass:"form-control",
                                        placeholder:this.state.to,
                                        onChange:this.onChangeTo
                                    },
                                    {
                                        label:"Submit",
                                        type:"button",
                                        bsClass:"form-control",
                                        value:"Submit new dates",
                                        onClick:this.submitStats
                                    }
                                ]}
                              />
                            </Grid>
                            }
                        />
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
