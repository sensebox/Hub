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
        zoomType:'x'

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
            topics:[]

        }
        this.componentDidMount = this.componentDidMount.bind(this);
        this.clearGraph = this.clearGraph.bind(this);
        this.setTitle = this.setTitle.bind(this);

        this.addValue = this.addValue.bind(this)
        this.setAxes = this.setAxes.bind(this)
        this.clearGraph = this.clearGraph.bind(this)
        this.setExtremes = this.setExtremes.bind(this)
    }
    componentDidMount(){
        this.setState({_notificationSystem: this.refs.notificationSystem})
        }
    componentDidUpdate(){}

    clearGraph(topics){
        let chart = this.myRef.current.chart
        console.log("Clearing the graph..")
        topics.map((topic)=>{
            if(chart.get(topic) && chart.get(topic+'_ax')){
            chart.get(topic).remove(false);
            chart.get(topic+'_ax').remove(false);
        }})
        chart.redraw();
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
    addValue(topic,val){
        let chart = this.myRef.current.chart
        chart.get(topic).addPoint(val,true,false)
    }

    setAxes(topics){
        let chart = this.myRef.current.chart 
        let toggle = false
        console.log("Creating an axis for each topic ... ")
        topics.map((topic)=>{
            if(chart.get(topic+'_ax')) return
            chart.addAxis({
                id:topic+'_ax',
                title:{
                    text:topic
                },
                opposite:toggle,
            })
            chart.addSeries({
                name:topic,
                id:topic,
                type:'spline',
                yAxis:topic+'_ax',
                data:[]
            })
            toggle = !toggle
        })
        this.setState({topics:topics})
    }

    setExtremes(topic,min,max){
        let chart = this.myRef.current.chart 
        let yAxis = chart.get(topic+'_ax')
        yAxis.setExtremes(min,max)
    }
    render(){
        return(
            <Grid fluid>
                <Row>
                <NotificationSystem ref="notificationSystem" style={style}/>
                </Row>
                <Row>
                <Col md={6}>
                    <GraphEdit setExtremes={this.setExtremes} topics={this.state.topics} setTitle = {this.setTitle} />
                </Col>
                <Col md={6}>
                    <Network clearGraph = {this.clearGraph} setAxes = {this.setAxes} addValue = {this.addValue} notifications={this.state._notificationSystem}/>
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