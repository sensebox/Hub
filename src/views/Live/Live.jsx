import React,{Component} from 'react'
import Button from 'components/CustomButton/CustomButton';
import { Grid, Row, Col,FormControl, ControlLabel,FormGroup,Panel } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import NotificationSystem from 'react-notification-system';
import {style} from "variables/Variables.jsx";
import 'assets/sass/custom.css'
import HighchartsReact from 'highcharts-react-official'
import Collapsible from 'react-collapsible';
import GraphEdit from 'components/Live/GraphEdit'
import Network from 'components/Live/Network'
global.Highcharts = require('highcharts');
require('highcharts/modules/exporting')(global.Highcharts);
require('highcharts/modules/export-data')(global.Highcharts);
require('highcharts/modules/no-data-to-display')(global.Highcharts);

var mqtt = require('mqtt')
var options = {
    chart: {
        defaultSeriesType: 'spline',

    },
    xAxis: {
        tickPixelInterval: 150,
    },
    series: [],
    yAxis:[],
    title:{
        text:"Live Messwerte"
    },
    exporting:{
        buttons: {
            contextButton:{
                menuItems:['downloadPNG','downloadSVG','downloadCSV']
            }
        }
    }

  };


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
            topics:[],
            key:"",
            topic:"",
            extreme1low:0,
            extreme1high:0,
            extreme2low:0,
            extreme2high:0,
            title:"Live Messwerte",
            panel1:"glyphicon glyphicon-chevron-up",
            panel2:"glyphicon glyphicon-chevron-up"

        }
        this.handleMQTT = this.handleMQTT.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.stopInterval = this.stopInterval.bind(this);
        this.handleBroker = this.handleBroker.bind(this);
        this.clearGraph = this.clearGraph.bind(this);
        this.setExtreme1 = this.setExtreme1.bind(this);
        this.setExtreme2 = this.setExtreme2.bind(this);
        this.handleExtreme1low = this.handleExtreme1low.bind(this);
        this.handleExtreme1high = this.handleExtreme1high.bind(this);
        this.handleExtreme2low = this.handleExtreme2low.bind(this);
        this.handleExtreme2high = this.handleExtreme2high.bind(this);
        this.setTitle = this.setTitle.bind(this);
        this.handlePanel1 = this.handlePanel1.bind(this);
        this.handlePanel2 = this.handlePanel2.bind(this);
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
        var level;
        if(!this.state.topics || !this.state.key || !this.state.ip){
             level = "error";
            this.state._notificationSystem.addNotification({
                title: (<span data-notify="icon" className="pe-7s-video"></span>),
                message: (
                    <div>
                        Please give an IP ,a topic and a key !
                    </div>
                ),
                level: level,
                position: position,
                autoDismiss: 5,
            });
        }
        else
        {

            level = 'info'; // 'success', 'warning', 'error' or 'info'
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
    }
    stopInterval(position){
        var level = 'warning'; // 'success', 'warning', 'error' or 'info'
        let chart = this.myRef.current.chart

        var axis1 = chart.get(this.state.topics[0]+"axis")
        var axis2 = chart.get(this.state.topics[1]+"axis")
        
        if(axis1) axis1 = axis1.getExtremes()
        if(axis2) axis2 = axis2.getExtremes()
            else axis2 = 
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
            extreme1low: axis1.min,
            extreme1high: axis1.max,
            extreme2low: axis2.min,
            extreme2high: axis2.max
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
        console.log(this.state.topics)
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
        if(axis)axis.setExtremes(this.state.extreme1low,this.state.extreme1high)
    }
    setExtreme2(){
        let chart = this.myRef.current.chart
        let axis = chart.get(this.state.topics[1]+"axis")
        if(axis)axis.setExtremes(this.state.extreme2low,this.state.extreme2high)
    }
    setTitle(e){
        let chart = this.myRef.current.chart
        const newTitle = e.target.value
        this.setState({title:newTitle})
        if(chart)
        chart.setTitle({
            text:newTitle
        })
        
    }
    handlePanel1(){
        var newClass = "" 
        if(this.state.panel1==="glyphicon glyphicon-chevron-up") newClass = "glyphicon glyphicon-chevron-down"
        else newClass = "glyphicon glyphicon-chevron-up"
        this.setState({panel1:newClass})
    }
    handlePanel2(){
        var newClass = "" 
        if(this.state.panel2==="glyphicon glyphicon-chevron-up") newClass = "glyphicon glyphicon-chevron-down"
        else newClass = "glyphicon glyphicon-chevron-up"
        this.setState({panel2:newClass})
    }
    render(){
        return(
            <Grid fluid>
                <Row>
                <NotificationSystem ref="notificationSystem" style={style}/>
                </Row>
                <Row>
                <Col md={6}>
                    <GraphEdit ref="GraphEdit"/>
                </Col>
                <Col md={6}>
                    <Network ref="Network"/>
                </Col>
                </Row>
                <Row> 
                    <Col md={12}>
                    <Card 
                        title="Live Recordings of the Sensor"
                        category="Live Measurement"
                        stats={this.state.listening ? "Listening for new data":"Currently not listening for new data"}
                        statsIcon="pe-7s-video"
                        content={
                            <HighchartsReact
                            highcharts={global.Highcharts}
                            options={options}
                            ref={this.myRef}
                            />                         
                            }
                        />
                </Col>
                </Row>
            </Grid>
        )
    }
}

export default Live