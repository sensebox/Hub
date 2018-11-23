import React,{Component} from 'react'
import Button from 'components/CustomButton/CustomButton';
import { Grid, Row, Col,FormControl, ControlLabel,FormGroup } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import NotificationSystem from 'react-notification-system';
import {style} from "variables/Variables.jsx";
import 'assets/sass/custom.css'
import ReactHighcharts from 'react-highcharts'

// import mqtt from 'mqtt'

var mqtt = require('mqtt')
var config = {
    xAxis: {
      categories: []
    },
    series: [],
    yAxis:[],
    title:{
        text:"Live Messwerte"
    }
  };
var time = 0 
/*
    The live page should show live measurements by a sensor
    the visualization will be refreshed everytime a new measurement comes in 
    for the data requests the mqtt-protocoll should be used 


*/

class Live extends Component {
    constructor(props){
        super()
        this.state={
            loading:false,
            _notificationSystem: null,
            listening:false,
            lastMeasurement:null,
            timestep:0,
            ip:"10.0.1.2",
            topics:[],
            username:"",
            topic:""

        }
        this.handleMQTT = this.handleMQTT.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.stopInterval = this.stopInterval.bind(this);
        this.handleBroker = this.handleBroker.bind(this);
        this.clearGraph = this.clearGraph.bind(this);
        this.handleIPInput = this.handleIPInput.bind(this);
        this.handleTopicInput = this.handleTopicInput.bind(this);
        this.handleUsernameInput = this.handleUsernameInput.bind(this);
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
        // prepare config variable for topic(s)
        var inputArr = this.state.topics
        for(var i=0;i<inputArr.length;i++){
            var opposite
            if(i===0) 
                opposite=true 
            else 
                opposite=false
            config.series.push({
                id:inputArr[i],
                name:inputArr[i],
                data:[],
                yAxis:i,
            })
            config.yAxis.push({
                title:{
                    text:inputArr[i]
                },
                opposite:opposite
            })
        }
        this.setState({listening:true})
        this.interval = setInterval(() => this.handleBroker(), 1000);

    }
    stopInterval(position){
        var level = 'info'; // 'success', 'warning', 'error' or 'info'
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
        this.setState({listening:false})
        clearInterval(this.interval)
    }
    clearGraph(){
        let chart = this.refs.chart.getChart()
        while( chart.series.length > 0) {
            chart.series[0].remove( false );
            chart.userOptions.series.shift();
        }
        while ( chart.yAxis.length > 0){
            chart.yAxis[0].remove( false )
        }
        console.log(chart)
        chart.redraw();
    }
     handleBroker(){      
        var client = mqtt.connect('mqtt://'+this.state.ip + ':1884')
        var that = this;
        client.on('connect', function () {
            // On connection subscribe to the topic
            client.subscribe(that.state.topics, function (err,value) {
            if (!err) {
            }
            })
        })
      
      client.on('message', function (topic, message) {
            var value = parseFloat(message.toString());
            let chart = that.refs.chart.getChart()            
            switch(topic){
                case chart.series[0].userOptions.id:
                    chart.series[0].addPoint(({y: value}))
                break;
                case chart.series[1].userOptions.id:
                    chart.series[1].addPoint(({y: value}))
                break;
                default:
                    chart.series[0].addPoint(({y: value}))

            }          
        client.end()
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
                            <ReactHighcharts config={config} ref="chart"></ReactHighcharts>
                        }
                        />
                </Col>
                <Col md={4}>
                <Row>
                        <Card
                            title = "Last Measurement"
                            category = "30 Seconds Ago"
                            stats = "Listening for new data"
                            statsIcon = "pe-7s-video"
                            content ={
                                <ul>
                                    <li>Value : {this.state.last}</li>
                                    <li>Timestep : {time} </li>
                                    <li>Sensor ID: 5a30ea5375a96c000f012fe0 </li>
                                    <li>Information : Number</li>
                                </ul>
                            }
                            />
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