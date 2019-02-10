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
            topics:[],
            connected:false,
            changed:true,
            inputs:['input-0']
        }
        this.changeip = this.changeip.bind(this)
        this.changekey = this.changekey.bind(this)
        this.changetopic = this.changetopic.bind(this)
        
        this.handleMQTT = this.handleMQTT.bind(this)
        this.disconnectMQTT = this.disconnectMQTT.bind(this)
        this.clearGraph = this.clearGraph.bind(this)

        this.addTopic = this.addTopic.bind(this)
        this.removeTopic = this.removeTopic.bind(this)
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
        let placeInArray = e.target.id
        let input = e.target.value
        var newTopics = this.state.topics
        newTopics[placeInArray] = input        
        this.setState({topics:newTopics})
    }
    clearGraph(){
        this.props.clearGraph(this.state.topics)
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
                console.log(that.state)
                console.log("Client Subscribe:","Succesfully connected to the given topics!")
                if(that.state.changed)
                    that.props.setAxes(that.state.topics)
                that.setState({connected:true})
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
        this.setState({connected:false,changed:false})
        client.end()
    }
    addTopic(e){
        var newInput = `input-${this.state.inputs.length}`
        this.setState(prevState => ({ inputs: prevState.inputs.concat([newInput]),topics:prevState.topics.concat(""),changed:true}));
    }

    removeTopic(e){
        if(this.state.inputs.length===1) return
        var newInput = this.state.inputs.filter((input)=>{
            return input != e.target.name
        })
        let regExp = /[0-9]/g
        let placeInArray = e.target.name.match(regExp)
        
        var newTopics = this.state.topics.filter((topic,index)=>{
            return parseInt(placeInArray) != index
        })
        this.setState({inputs:newInput,topics:newTopics,changed:true})
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
                            defaultValue={this.state.ip}
                            placeholder="Enter IP"
                            onChange = {this.changeip}
                            />
                        <FormControl
                            type="text"
                            value={this.state.key}
                            placeholder="Enter topic key"
                            onChange = {this.changekey}
                            />  
                        <FormControl.Feedback/>
                    </FormGroup>
                </Row>
                <ControlLabel>Subscribed topics</ControlLabel>
                <FormGroup>
                    <Row id='dynamicInput'>
                        {this.state.inputs.map((input,index)=>
                        <Row key={input}>
                            <Col md={6}>
                                <FormControl 
                                id={index.toString()}
                                placeholder="Give new topic name here"
                                onChange ={this.changetopic}                           
                                />
                            </Col>
                            <Col md={6}>
                                <Button 
                                    bsStyle = "info" 
                                    onClick={this.addTopic} 
                                    > 
                                    Add Topic
                                </Button>
                                <Button 
                                    style={{marginLeft:"5px"}} 
                                    bsStyle = "danger" 
                                    onClick={this.removeTopic} 
                                    name = {input}
                                    > 
                                    Remove Topic
                                </Button>
                            </Col>
                        </Row>)}
                    </Row>
                    </FormGroup>
                <Row>
                    {this.state.connected ? <Button bsStyle="warning" onClick={this.disconnectMQTT}>Disconnect from MQTT</Button>
                                          :  <Button bsStyle="info" onClick={this.handleMQTT}>Connect to MQTT</Button>
                    }
                    <Button bsStyle="danger" style={{marginLeft:"5px"}} disabled = {this.state.connected} onClick={this.clearGraph}>Clear graph data</Button>
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