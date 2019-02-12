import React,{Component} from 'react'
import Button from 'components/CustomButton/CustomButton'
import {Grid,Row,Col,FormControl,ControlLabel,FormGroup,Panel} from 'react-bootstrap'
import Card from 'components/Card/Card'
import Collapsible from 'react-collapsible';
import {MdKeyboardArrowDown} from 'react-icons/md'
import {FormInputs} from 'components/FormInputs/FormInputs.jsx'
var mqtt = require('mqtt')
var client;
class Network extends Component{
    constructor(props){
        super(props)
        this.state = {
            ip:'192.168.0.53',
            port:"1884",
            key:'',
            topics:[],
            connected:false,
            inputs:['input-0']
        }
        this.changeip = this.changeip.bind(this)
        this.changekey = this.changekey.bind(this)
        this.changetopic = this.changetopic.bind(this)
        this.changeport = this.changeport.bind(this)
        this.changeusername = this.changeusername.bind(this)
        this.changepassword = this.changepassword.bind(this)
        
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
    changeport(e){
        let port = e.target.value
        this.setState({port})
    }
    changekey(e){
        let key = e.target.value
        this.setState({key})
    }
    changeusername(e){
        let username = e.target.value
        this.setState({username})
    }
    changepassword(e){
        let password = e.target.value
        this.setState({password})
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
    changeport(e){
        let port = e.target.value
        this.setState({port})
    }
    handleMQTT(){
        console.log('Connecting to MQTT Server ... ')
        // Give out notification 
        this.props.setLoading(true);
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
        // Options variable stored for mqtt connection
        var options ={
            port:this.state.port,
            host:this.state.ip,
            username:this.state.username,
            password:this.state.password
            }   
        client = mqtt.connect(options)
        var that = this;
    
        client.on('connect', function () {
            // On connection subscribe to the topic and create according axes for the values
            client.subscribe(that.state.topics, function (err,granted) {
             if (!err) {
                console.log("Client Subscribe:","Succesfully connected to the given topics!")
                that.props.setAxes(that.state.topics)
                that.setState({connected:true})
                console.log("Done!Showing values(if there are any)now!")
            }
            else{
                console.log("Error found when subscribin:",err.message)
            }
            })
        })
      client.on('error',function(error){
          console.log("Error occured this is the message:",error.message)
          client.end();
      })
      client.on('message', function (topic, message) {
            let value = parseFloat(message.toString());
            that.props.addValue(topic,value)
                })  
    }

    disconnectMQTT(){
        console.log("Disconnecting from MQTT now")
        this.props.setLoading(false)
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
        this.setState(prevState => ({ inputs: prevState.inputs.concat([newInput])}));
    }

    removeTopic(e){
        var newInput = this.state.inputs.filter((input)=>{
            return input != e.target.name
        })
        let regExp = /[0-9]/g
        let placeInArray = e.target.name.match(regExp)
        
        var newTopics = this.state.topics.filter((topic,index)=>{
            return parseInt(placeInArray) != index
        })
        this.props.clearGraph([this.state.topics[placeInArray]])
        this.setState({inputs:newInput,topics:newTopics})
    }


    render(){
        return(
            <Panel className="margin_panel" bsStyle="success">
            <Collapsible trigger = {
                <div onClick={this.handlePanel2} className="panel-heading"> 					
                <h3 className="panel-title collaps-title">Network functionalities</h3>
                 <span className="pull-right clickable"><MdKeyboardArrowDown size={'1.5em'}/></span></div>}>
            <Card 
            content={
            <Grid fluid>
                <FormInputs
                    ncols ={["col-md-8","col-md-4"]}
                    proprieties={[
                        {
                            label:"Server address",
                            type:"text",
                            bsClass:"form-control",
                            placeholder:"Server address",
                            defaultValue:this.state.ip,
                            onChange:this.changeip
                        },
                        {
                            label:"Port",
                            type:"text",
                            bsClass:"form-control",
                            placeholder:"Port number",
                            defaultValue:this.state.port,
                            onChange:this.changeport
                        }
                    ]}
                />
                <FormInputs
                    ncols={["col-md-8","col-md-4"]}
                    proprieties={[
                        {
                            label:"Username",
                            placeholder:"Username",
                            bsClass:"form-control",
                            type:"text",
                            defaultValue:"",
                            onChange:this.changeusername
                        },
                        {
                            label:"Password",
                            placeholder:"Password",
                            bsClass:"form-control",                                
                            type:"password",
                            onChange:this.changepassword
                        }
                    ]}                    
                />
                <ControlLabel>Subscribed topics</ControlLabel>
                {this.state.inputs.map((input,index)=>
                    <Row key={index}>
                        <Col md={8}>
                        <FormInputs
                            ncols={["col-md-12"]}
                            proprieties={[
                                {
                                    id:index.toString(),
                                    bsClass:"form-control",
                                    type:"text",
                                    placeholder:"Give new topic name here",
                                    onChange:this.changetopic
                                }
                            ]}
                        />
                        </Col>
                        <Col md={4}>
                            <Button
                                className="topic_add_button"
                                onClick={this.addTopic}
                                bsStyle="success"                         
                            >
                            Add topic
                            </Button>
                            {index ? 
                                    <Button 
                                        style={{marginLeft:"5px"}} 
                                        bsStyle = "warning" 
                                        onClick={this.removeTopic} 
                                        name = {input}
                                        className="topic_add_button"> 
                                        Remove Topic
                                    </Button>
                                    :
                                    <div className="noshow"/> }
                        </Col>
                    </Row>
                        )}
                <Row>
                    <Col md={12}>
                    {this.state.connected ? <Button bsStyle="warning" onClick={this.disconnectMQTT}>Disconnect from MQTT</Button>
                                          :  <Button bsStyle="info" onClick={this.handleMQTT}>Connect to MQTT</Button>
                    }

                    <Button bsStyle="danger" style={{marginLeft:"5px"}} disabled = {this.state.connected} onClick={this.clearGraph}>Clear graph data</Button>
                    </Col>
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