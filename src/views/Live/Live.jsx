import React,{Component} from 'react'
import { Grid, Row, Col } from "react-bootstrap";
import 'assets/skins/all.css'
import { Card } from "components/Card/Card.jsx";
import NotificationSystem from 'react-notification-system';
import {style} from "variables/Variables.jsx";
import 'assets/sass/custom.css'
import HighchartsReact from 'highcharts-react-official'
import GraphEdit from 'custom/Live/GraphEdit'
import Network from 'custom/Live/Network'
global.Highcharts = require('highcharts');
require('highcharts/modules/exporting')(global.Highcharts);
require('highcharts/modules/export-data')(global.Highcharts);
require('highcharts/modules/no-data-to-display')(global.Highcharts);

// eslint-disable-next-line
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

// eslint-disable-next-line
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
            topics:[],
            connected:true

        }
        this.componentDidMount = this.componentDidMount.bind(this);
        this.clearGraph = this.clearGraph.bind(this);
        this.setTitle = this.setTitle.bind(this);

        this.addValue = this.addValue.bind(this)
        this.setAxes = this.setAxes.bind(this)
        this.clearGraph = this.clearGraph.bind(this)

        this.setExtremes  = this.setExtremes.bind(this)
        this.setNewTopic = this.setNewTopic.bind(this)
        this.setLoading = this.setLoading.bind(this)
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
            return null;
        }
            return null;
        })

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
        topics.map((topic)=>{
            if(chart.get(topic+'_ax')) return null;
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
            toggle = !toggle;
            return null;
        })
        this.setState({topics:topics})
    }
    setNewTopic(topics){
        this.setState({
            topics
        })
    }
    setExtremes(topic,min,max){
        let chart = this.myRef.current.chart 
        let yAxis = chart.get(topic+'_ax')
        yAxis.setExtremes(min,max)
    }
    setLoading(bool){
        this.setState({
            connected:bool
        })
    }
    render(){
        return(
            <Grid fluid>
                <Row>
                <NotificationSystem ref="notificationSystem" style={style}/>
                </Row>
                <Row>
                <Col md={6}>
                    <GraphEdit 
                        setExtremes={this.setExtremes}
                        topics={this.state.topics}
                        setTitle = {this.setTitle}
                        />
                </Col>
                <Col md={6}>
                    <Network
                            setLoading={this.setLoading}
                            setNewTopic={this.setNewTopic}
                            clearGraph = {this.clearGraph}
                            setAxes = {this.setAxes}
                            addValue = {this.addValue}
                            notifications={this.state._notificationSystem}
                    />
                </Col>
                </Row>
                <Row> 
                    <Col md={12}>
                    <Card 
                        title="Live Recordings of the Sensor"
                        category="Live Measurement"
                        stats={this.state.connected ? "Currently recording live values"
                                                    : "Not recording live values"}
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