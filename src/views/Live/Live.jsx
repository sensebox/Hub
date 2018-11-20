import React,{Component} from 'react'
import Button from 'components/CustomButton/CustomButton';
import { Grid, Row, Col } from "react-bootstrap";
import 'assets/skins/all.css'
import {LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,Legend,CartesianAxis} from 'recharts'
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
    series: [{
      data: []
    }],
    title:{
        text:"Live Messwerte"
    }
  };
var last = 0 
var time = 0 
/*
    The live page should show live measurements by a sensor
    the visualization will be refreshed everytime a new measurement comes in 
    for the data requests the mqtt-protocoll should be used 


    TODO:
        => Do research on mqtt 
        => set up an mqtt server on raspbian 
        => 'subscrice' to the mqtt server and listen for changes 
        => dissplay these changes in a graph 

*/

class Live extends Component {
    constructor(props){
        super()
        this.state={
            generated:false,
            data:[
                {Zeit:"1",value:24},

            ],
            config:{
                xAxis:{
                    categories:[]
                },
                series:[{
                    data:[]
                }]
            },
            loading:false,
            _notificationSystem: null,
            listening:false,
            lastMeasurement:null,
            timestep:0

        }
        this.generateId = this.generateId.bind(this);
        this.handleMQTT = this.handleMQTT.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.stopInterval = this.stopInterval.bind(this);
        this.handleBroker = this.handleBroker.bind(this);
        this.clearGraph = this.clearGraph.bind(this);
    }
    componentDidMount(){
        this.setState({_notificationSystem: this.refs.notificationSystem})


        }
    componentDidUpdate(){
        console.log(this.refs.chart.getChart())
    }
    componentWillUnmount(){
        clearInterval(this.interval)
    }
    generateId(){
        this.setState({
            generated:true
        })
    }

    handleMQTT(position){
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
        while( chart.series.length > 0 ) {
            chart.series[0].remove( false );
        }
        chart.redraw();
    }
     handleBroker(){
        var client = mqtt.connect('mqtt://10.0.1.95:1884')
        var that = this;
        client.on('connect', function () {
            // On connection subscribe to the topic
            client.subscribe('temperatur', function (err,value) {
            if (!err) {
            }
            })
        })
      
      client.on('message', function (topic, message) {
          var value = parseFloat(message.toString());
          let chart = that.refs.chart.getChart()
          chart.series[0].addPoint(({y: value}))
          
        client.end()
      })  
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
                                    <li> Value : {this.state.last}</li>
                                    <li> Timestep : {time} </li>
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
                                        <Button onClick={()=>this.addValue()} className="eric_button" bsStyle="info">Add random value</Button>
                                    </Row>
                                    <Row>
                                        {this.state.generated ?
                                        <p>5a30ea5375a96c000f012fe0</p> : 
                                        <Button onClick={()=>this.generateId()} className="eric_button" bsStyle="success">Generate SensorID</Button>
                                        }
                                    </Row>
                                    <Row>
                                        {this.state.listening ? 
                                        <Button onClick={this.stopInterval.bind(this,'tc')} className="eric_button" bsStyle ="danger">Stop Listening to MQTT</Button>:
                                        <Button onClick={this.handleMQTT.bind(this,'tc')} className="eric_button" bsStyle="primary">Listen to MQTT</Button>
                                        }
                                    </Row>
                                    <Row>
                                        <Button onClick={()=>this.clearGraph()} className="eric_button" bsStyle="danger">Clear data</Button>
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