import React,{Component} from 'react'
import Button from 'components/CustomButton/CustomButton';
import { Grid, Row, Col,FormControl, ControlLabel,FormGroup } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import NotificationSystem from 'react-notification-system';
import {style} from "variables/Variables.jsx";
import 'assets/sass/custom.css'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

// import mqtt from 'mqtt'

var mqtt = require('mqtt')
var options = {
    chart: {
        defaultSeriesType: 'spline'
    },
    xAxis: {
        tickPixelInterval: 150,
    },
    series: [],
    yAxis:[],
    title:{
        text:"Live Messwerte"
    }
  };


var time = 0 
var client;
/*
    The live page should show live measurements by a sensor
    the visualization will be refreshed everytime a new measurement comes in 
    for the data requests the mqtt-protocoll should be used 


*/

class Live extends Component {
    constructor(props){
        super(props)
        this.myRef = React.createRef();  

        this.state={
            loading:false,
            _notificationSystem: null,
            listening:false,
            lastMeasurement:null,
            timestep:0,
            ip:"10.0.1.2",
            topics:["temperatur","humidity"],
            username:"",
            topic:"",
            extreme1low:0,
            extreme1high:0,
            extreme2low:0,
            extreme2high:0

        }
        this.handleMQTT = this.handleMQTT.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.stopInterval = this.stopInterval.bind(this);
        this.handleBroker = this.handleBroker.bind(this);
        this.clearGraph = this.clearGraph.bind(this);
        this.handleIPInput = this.handleIPInput.bind(this);
        this.handleTopicInput = this.handleTopicInput.bind(this);
        this.handleUsernameInput = this.handleUsernameInput.bind(this);
        this.setExtreme1 = this.setExtreme1.bind(this);
        this.setExtreme2 = this.setExtreme2.bind(this);
        this.handleExtreme1low = this.handleExtreme1low.bind(this);
        this.handleExtreme1high = this.handleExtreme1high.bind(this);
        this.handleExtreme2low = this.handleExtreme2low.bind(this);
        this.handleExtreme2high = this.handleExtreme2high.bind(this);

    }
    componentDidMount(){
        this.setState({_notificationSystem: this.refs.notificationSystem})


        }
    componentDidUpdate(){}

    componentWillUnmount(){
        clearInterval(this.interval)
    }


    handleMQTT(position){
        // give notification
        var level = 'info'; // 'success', 'warning', 'error' or 'info'
        this.state._notificationSystem.addNotification({
            title: (<span data-notify="icon" className="pe-7s-video"></span>),
            message: (
                <div>
                    Now listening to the MQTT-Server
                </div>
            ),
            level: level,
            position: position,
            autoDismiss: 5,
        });
        let chart = this.myRef.current.chart
        if(!chart.get(this.state.topics[0]))
        {this.state.topics.map((topic,index)=>{
            
            chart.addAxis({
                id:topic+"axis",
                title:{
                    text:topic
                },
                opposite:index
                })
            chart.addSeries({
                name:topic,
                id:topic,
                type:"spline",
                data:[],
                yAxis:topic+"axis",
                marker:{enabled:false}
            })
        })}
        this.setState({listening:true})
        this.handleBroker();

    }
    stopInterval(position){
        var level = 'warning'; // 'success', 'warning', 'error' or 'info'
        let chart = this.myRef.current.chart
        var extremes1 = chart.get(this.state.topics[0]+"axis").getExtremes();
        var extremes2 = chart.get(this.state.topics[1]+"axis").getExtremes();
        this.state._notificationSystem.addNotification({
            title: (<span data-notify="icon" className="pe-7s-video"></span>),
            message: (
                <div>
                    Stopped listening to the MQTT-Server
                </div>
            ),
            level: level,
            position: position,
            autoDismiss: 5,
        });
        this.setState({
            listening:false,
            extreme1low: extremes1.min,
            extreme1high: extremes1.max,
            extreme2low: extremes2.min,
            extreme2high: extremes2.max
        })
        client.end()
    }

    clearGraph(){
        let chart = this.myRef.current.chart
        while( chart.series.length > 0) {
            chart.series[0].remove( false );
            chart.userOptions.series.shift();
        }
        while ( chart.yAxis.length > 0){
            chart.yAxis[0].remove( false )
        }
        chart.redraw();
    }
     handleBroker(){      
        client = mqtt.connect('mqtt://'+this.state.ip + ':1884')
        var that = this;
        let chart = this.myRef.current.chart

        client.on('connect', function () {
            // On connection subscribe to the topic
            client.subscribe(that.state.topics, function (err,value) {
            if (!err) {
            }
            })
        })
      
      client.on('message', function (topic, message) {
            var value = parseFloat(message.toString());
            chart.get(topic).addPoint(value,true,false)
                })  
    }
    handleIPInput(e){
        this.setState({ ip: e.target.value })
    }
    handleTopicInput(e){
        var input = e.target.value
        this.setState({ topics: input.split(','),topic:input })
    }
    handleUsernameInput(e){
        this.setState({ username: e.target.value })
    }
    handleExtreme1low(e){
        this.setState({extreme1low:e.target.value})
    }
    handleExtreme1high(e){
        this.setState({extreme1high:e.target.value})
    }
    handleExtreme2low(e){
        this.setState({extreme2low:e.target.value})
    }
    handleExtreme2high(e){
        this.setState({extreme2high:e.target.value})
    }
    setExtreme1(){
        let chart = this.myRef.current.chart
        let axis = chart.get(this.state.topics[0]+"axis")
        axis.setExtremes(this.state.extreme1low,this.state.extreme1high)
    }
    setExtreme2(){
        let chart = this.myRef.current.chart
        let axis = chart.get(this.state.topics[1]+"axis")
        
        axis.setExtremes(this.state.extreme2low,this.state.extreme2high)
    }


    render(){
        if(!this.state.loading){
        return(
            <Grid fluid>
                <Row>
                <NotificationSystem ref="notificationSystem" style={style}/>

                </Row>
                <Row> 
                    <Col md={8}>
                    <Card 
                        title="Live Recordings of the Sensor"
                        category="Live Measurement"
                        stats="Listening for new data"
                        statsIcon="pe-7s-video"
                        content={
            <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={this.myRef}
            />                         
            }
                        />
                </Col>
                <Col md={4}>
                <Row>
                    <Card 
                        title="Configure the graph"
                        category = "Set minimum and maxium for the yAxis"
                        content={
                            <Grid fluid>
                            <Row>
                                <FormGroup>
                                    <ControlLabel>{this.state.topics[0]}</ControlLabel>
                                <FormControl
                                        bsSize="sm"
                                        type ="number"
                                        value={this.state.extreme1low}
                                        placeholder="Scale"
                                        onChange = {this.handleExtreme1low}
                                        />
                                <FormControl
                                        bsSize="sm"
                                        type ="number"
                                        value={this.state.extreme1high}
                                        placeholder="Scale"
                                        onChange = {this.handleExtreme1high}
                                        />     
                                <FormControl
                                    bsSIze ="sm"
                                    type="button"
                                    value="Set scale for first yAxis"
                                    onClick={this.setExtreme1}
                                    />
                                </FormGroup>
                            </Row>
                            { this.state.topics.length>1 ? 
                            <Row>
                                <FormGroup>
                                    <ControlLabel>{this.state.topics[1]}</ControlLabel>
                                <FormControl
                                        bsSize="sm"
                                        type ="number"
                                        value={this.state.extreme2low}
                                        placeholder="Scale"
                                        onChange = {this.handleExtreme2low}
                                        />
                                <FormControl
                                        bsSize="sm"
                                        type ="number"
                                        value={this.state.extreme2high}
                                        placeholder="Scale"
                                        onChange = {this.handleExtreme2high}
                                        />     
                                <FormControl
                                    bsSIze ="sm"
                                    type="button"
                                    value="Set scale for second yAxis"
                                    onClick={this.setExtreme2}
                                    />
                                </FormGroup>
                                </Row>
                                :
                            <div></div>}
                            </Grid>
                        }/>
                    </Row>
                    <Row>
                            <Card 
                                title="Testing functionalities"
                                catgerory="Delete after deploy"
                                stats ="Testing purposes only"
                                statsIcon="pe-7s-note2"
                                content={
                                    <Grid fluid>
                                    <Row>
                                        <form>
                                            <FormGroup
                                                controlId="formBasicText">
                                                <ControlLabel>Enter your credentials</ControlLabel>
                                                <FormControl
                                                    type="text"
                                                    value={this.state.ip}
                                                    placeholder="Enter IP"
                                                    onChange={this.handleIPInput}
                                                    />
                                                <FormControl
                                                    type="text"
                                                    value={this.state.topic}
                                                    placeholder="Enter Topic"
                                                    onChange={this.handleTopicInput}
                                                    />
                                                <FormControl
                                                    type="text"
                                                    value={this.state.username}
                                                    placeholder="Enter username"
                                                    onChange={this.handleUsernameInput}
                                                    />
                                                <FormControl
                                                    type="password"
                                                    value={this.state.password}
                                                    placeholder="Enter Password"
                                                    onChange={this.handlePassword}
                                                    />
                                                <FormControl.Feedback/>
                                            </FormGroup>
                                        </form>
                                    </Row>
                                    <Row>
                                        {this.state.listening ? 
                                        <Button onClick={this.stopInterval.bind(this,'tc')} className="eric_button" bsStyle ="danger">Stop Listening to MQTT</Button>:
                                        <Button onClick={this.handleMQTT.bind(this,'tc')} className="eric_button" bsStyle="primary">Listen to MQTT</Button>
                                        }
                                    </Row>
                                    <Row>
                                        <Button onClick={()=>this.clearGraph()} disabled={this.state.listening} className="eric_button" bsStyle="danger">Clear data</Button>
                                    </Row>
                                    </Grid>
                                }
                                />
                </Row>
                </Col>
                </Row>
            </Grid>
        )}
        else{
            return(
                <div className="spinner"></div>
            )
        }
    }
}

export default Live