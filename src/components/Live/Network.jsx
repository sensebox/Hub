import React,{Component} from 'react'
import {Grid,Row,Col,FormControl,ControlLabel,FormGroup,Panel,Button} from 'react-bootstrap'
import Card from 'components/Card/Card'
import Collapsible from 'react-collapsible';
import {MdKeyboardArrowDown} from 'react-icons/md'


var mqtt = require('mqtt')
var client;
class Network extends Component{
    constructor(props){
        super(props)
        this.state = {
            ip:'192.168.0.53',
            key:'',
            topics:['des/temperatur','des/humidity'],
            connected:false
        }
        this.changeip = this.changeip.bind(this)
        this.changekey = this.changekey.bind(this)
        this.changetopic = this.changetopic.bind(this)
        
        this.handleMQTT = this.handleMQTT.bind(this)
        this.disconnectMQTT = this.disconnectMQTT.bind(this)
    }
    changeip(e){
        let ip = e.target.value
        this.setState({ip})
    }
    changekey(e){
        let key = e.target.value
        this.setState({key})
    }
    changetopic(e){
        let input = e.target.value
        let topics = input.split(',')
        this.setState({topics})
    }

    handleMQTT(){
        console.log('Connecting to MQTT Server ... ')
        // Give out notification 
        this.props.notifications.addNotification({
            title: (<span data-notify="icon" className="pe-7s-video"></span>),
            message: (
                <div>
                    Live Data is now recording
                </div>
            ),
            level: "info",
            position: 'tc',
            autoDismiss: 5,
        });
        client = mqtt.connect('mqtt://'+this.state.ip + ':1884')
        var that = this;
    
        client.on('connect', function () {
            // On connection subscribe to the topic and create according axes for the values
            client.subscribe(that.state.topics, function (err,value) {
            if (!err) {
                console.log("Client Subscribe:","Succesfully connected to the given topics!")
                that.setState({connected:true})
                that.props.setAxes(that.state.topics)
            }
            else{
                console.log("Error found when subscribin:",err.message)
            }
            })
        })
      
      client.on('message', function (topic, message) {
            let value = parseFloat(message.toString());
            that.props.addValue(topic,value)
                })  
    }

    disconnectMQTT(){
        console.log("Disconnecting from MQTT now")

        this.props.notifications.addNotification({
            title: (<span data-notify="icon" className="pe-7s-video"></span>),
            message: (
                <div>
                    Disconnected from MQTT
                </div>
            ),
            level: "warning",
            position: 'tc',
            autoDismiss: 5,
        });
        this.setState({connected:false})
        client.end()
    }
    render(){
        return(
            <Panel className="margin_panel" bsStyle="success">
            <Collapsible trigger = {
                <div onClick={this.handlePanel2} className="panel-heading"> 					
                <h3 className="panel-title collaps-title">Network functionalities</h3>
                 <span className="pull-right clickable"><MdKeyboardArrowDown size={'1.5em'}/></span></div>}>
            <Card 
            category="Edit your connection details"
            content={
                <Grid fluid>
                <Row>
                        <FormGroup
                            controlId="formBasicText">
                            <ControlLabel>Enter your credentials</ControlLabel>
                            <FormControl
                                type="text"
                                value={this.state.ip}
                                placeholder="Enter IP"
                                onChange = {this.changeip}
                                />
                            <FormControl
                                type="text"
                                value={this.state.key}
                                placeholder="Enter topic key"
                                onChange = {this.changekey}
                                />   
                            <FormControl
                                type="text"
                                value={this.state.topic}
                                placeholder="Enter Topic"
                                onChange = {this.changetopic}
                                />
                            <FormControl.Feedback/>
                        </FormGroup>
                </Row>
                <Row>
                    {this.state.connected ? <Button onClick={this.disconnectMQTT}>Disconnect from MQTT</Button>
                                          :  <Button onClick={this.handleMQTT}>Connect to MQTT</Button>
                    }
                    <Button onClick={()=>{this.props.clearGraph(this.state.topics)}} >Clear graph data</Button>
                </Row>
                </Grid>
            }
            />
            </Collapsible>
            </Panel>
        )
    }
}

export default Network