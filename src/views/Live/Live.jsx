import React,{Component} from 'react'
import Button from 'components/CustomButton/CustomButton';
import { Grid, Row, Col } from "react-bootstrap";
import 'assets/skins/all.css'
import {LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,Legend,CartesianAxis} from 'recharts'
import { Card } from "components/Card/Card.jsx";
import NotificationSystem from 'react-notification-system';
import {style} from "variables/Variables.jsx";
import 'assets/sass/custom.css'
/*
    The live page should show live measurements by a sensor
    the visualization will be refreshed everytime a new measurement comes in 
    for the data requests the mqtt-protocoll should be used 


    TODO:
        => Do research on mqtt 
        => set up an mqtt server on raspbian 
        => 'subscrice' to the mqtt server and listen for changes 
        => display these changes in a graph 

*/

class Live extends Component {
    constructor(props){
        super()
        this.state={
            generated:false,
            data:[
                {Zeit:"1",value:10},
                {Zeit:"2",value:8},
                {Zeit:"3",value:12},
                {Zeit:"4",value:6},
                {Zeit:"5",value:14},
                {Zeit:"6",value:4},
                {Zeit:"7",value:16},
                {Zeit:"8",value:12},
                {Zeit:"9",value:5},
            ],
            loading:false,
            _notificationSystem: null,
            listening:false

        }
        this.generateId = this.generateId.bind(this);
        this.addValue = this.addValue.bind(this);
        this.handleMQTT = this.handleMQTT.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.stopInterval = this.stopInterval.bind(this);

    }
    componentDidMount(){
        this.setState({_notificationSystem: this.refs.notificationSystem})

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
        this.interval = setInterval(() => this.addValue(), 5000);

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
    async addValue(){
        var randomNumber = Math.floor ((Math.random() * 10)+1);
        var continousTime = parseFloat(this.state.data[this.state.data.length-1].Zeit) + 1
        continousTime = continousTime.toString();
        var newData = this.state.data
        newData.push({Zeit:continousTime,value:randomNumber})
        await this.setState({
            data:[],
            loading:true
        })
        this.setState({
            data:newData,
            loading:false
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
                            <LineChart width={1200} height={500} data={this.state.data}>
                            <CartesianGrid stroke="#ccc" />
                            <YAxis yAxisId={0} />
                            <XAxis dataKey="Zeit"/>
                            <Line isAnimationActive={false} yAxisId={0} type="monotone" dot={{ fill:'#8884d8', stroke: '#8884d8', strokeWidth: 1 }} dataKey={"value"} stroke="#8884d8"/>
                            <Tooltip/>
                            <Legend/>
                          </LineChart>
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
                                    <li> Value : {this.state.data[this.state.data.length-1].value}</li>
                                    <li> Timestep : {this.state.data[this.state.data.length-1].Zeit} </li>
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