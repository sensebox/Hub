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
import {FormInputs} from 'components/FormInputs/FormInputs.jsx'

// Options variable that is needed for Highcharts
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
    }
}


var moment = require('moment')
class Dashboard extends Component {
  constructor(props){
    super(props)
    this.myRef = React.createRef();  
    this.state={
      selected:["Loading...",""],
      checkboxChecked:false,
      hasError:false,
      toggle:true,
      loading:true,
      json:[],
      panel1:"glyphicon glyphicon-chevron-up",
      from:"",
      to:"",
    }
    this.handleRadio = this.handleRadio.bind(this);
    this.handlePanel1 = this.handlePanel1.bind(this);
    this.onChangeFrom = this.onChangeFrom.bind(this);
    this.onChangeTo = this.onChangeTo.bind(this)
    this.submitStats = this.submitStats.bind(this);
  } 
  /*--------------------------------React-------------------------------------*/
    componentDidMount(){
        this.initial()
        }
  /*-------------------------------------Helper&Handler------------------------------*/
    onChangeFrom(e){
        var newDate = e.target.value ;
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
    /**
     * handler to change phenomenons to show in graph
     * @param {event} e 
     */
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
    /**
     * Gets called when a custom request(i.e. through the date form) is made
     * @param {object that comes from the API call in initial()} json 
     * @param {phenomenon to pulls stats from} title 
     */
    statisticsHandler(json,title){
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
    }

    /**
     * Gets called when the page is loaded for the first time
     * @param {object that comes from the API call in initial()} json 
     * @param {phenomenon to pulls stats from} title 
     */
    initialHanlder(json,title){
        console.log(json)
            this.setState((prevState)=>{
                json:prevState.json.push({typ:title,data:json})
            })
    }
    cutArray(steps,oldArr){
        var arr = [];
        for(var i=0;i<oldArr.length;i=i+steps){      
        arr.push(oldArr[i])
        }
        return arr;

    }
    /** handles the submit button for new dates */
    submitStats(){
        let chart = this.myRef.current.chart
        chart.showLoading();
        if(chart.series>0){
            this.removeSeries(this.state.selected[0])
            this.removeSeries(this.state.selected[1])
        }

        this.setState({
            json:[]
        },function(){
        this.state.sensors.map((sensor)=>{
            this.getStatistics(sensor._id,sensor.title,true)
        })  
        })
        
    }
    /*----------------------------------Network------------------------------------------*/

    /**
     * initial() gets called after the component did mount 
     * uses the ID from the URL make a call to api.opensensemap.org
     * calls getStatistics() to get stats from every sensor
     */
    initial(){  
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
            this.getStatistics(sensor._id,sensor.title,false);
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
    
    getStatistics(sensorid,title,initial){
        let url = 'https://api.opensensemap.org/'
        initial ?   url+="statistics/descriptive?boxId="+this.props.match.params.id+"&phenomenon="+
                    title+"&from-date="+this.state.from+"T00:00:00.032Z&to-date="+this.state.to+"T00:00:00.032Z&operation=arithmeticMean"+
                    "&window=300000&format=json" 
                : 
                    url+='boxes/'+this.props.match.params.id+'/data/'+sensorid 
        fetch(url)
        .then((response)=>{
            if(response.ok)
                return response.json()
            this.setState({
                hasError:"no measurement"
            })
            throw new Error('Box has no measurements to fetch')
        })
        .then((json)=>{
            initial ? this.statisticsHandler(json,title) : this.initialHanlder(json,title)
        })
        .then(()=>{
            if(this.state.json.length === this.state.sensors.length){
                this.addXAxis()
                this.addSeries(this.state.json[0].typ,true)
                this.addSeries(this.state.json[1].typ,false)
                this.setState(
                    {selected:[this.state.json[0].typ,this.state.json[1].typ],
                    loading_stats:false})
                this.myRef.current.chart.hideLoading();
            }
        })
        .catch(function(error){
            console.log('Error: ', error.message)
        })
        }
/* ------------------------------------Visualization-------------------------------*/
    /**
     * Returns an array that is derived from the senseBox data
     * this array holds all dates and can be used to 
     * create an xAxis for HighCharts
     */
    createXAxis(){

        const length = this.state.json[0].data.length;
        const to = moment(this.state.json[0].data[0].createdAt).format('YYYY-MM-DD')
        const from = moment(this.state.json[0].data[length-1].createdAt).format('YYYY-MM-DD')
        this.setState({
            from:from,
            to:to
        })

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
 /*-------------------Start render()------------------*/

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
            <Col md={10} >
            <Card   
                id="chartHours"
                title={this.state.selected[0] +"/" + this.state.selected[1]}
                category={this.state.range}
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
                                ncols={["col-md-12","col-md-12","col-md-12"]}
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
                                        defaultValue:this.state.to,
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
