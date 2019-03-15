import React,{Component} from 'react'
import Button from 'components/CustomButton/CustomButton'
import {Grid,Row,Col,ControlLabel,Panel} from 'react-bootstrap'
import Card from 'components/Card/Card'
import Collapsible from 'react-collapsible';
import {MdKeyboardArrowDown} from 'react-icons/md'
import {FormInputs} from 'components/FormInputs/FormInputs.jsx'
import Radio from 'components/CustomRadio/CustomRadio'

var mqtt = require('mqtt')
var client;
class Network extends Component{
    constructor(props){
        super(props)
        this.state = {
            host:null,
            port:null,
            key:null,
            topics:[],
            connected:false,
            inputs:['input-0'],
            username: null,
            password: null,
            checkbox:false,
            radio:"1"
        }
        this.changehost = this.changehost.bind(this)
        this.changekey = this.changekey.bind(this)
        this.changetopic = this.changetopic.bind(this)
        this.changeport = this.changeport.bind(this)
        this.changeusername = this.changeusername.bind(this)
        this.changepassword = this.changepassword.bind(this)
        
        this.handleMQTT = this.handleMQTT.bind(this)
        this.disconnectMQTT = this.disconnectMQTT.bind(this)
        this.clearGraph = this.clearGraph.bind(this)

        /*
        */
        this.sensebox = this.sensebox.bind(this)
        this.addTopic = this.addTopic.bind(this)
        this.removeTopic = this.removeTopic.bind(this)
        this.dioty = this.dioty.bind(this)
        this.own = this.own.bind(this)
    }

    componentDidMount() {
        this.sensebox('cdm')
    }
    changehost(e){
        let host = e.target.value
        this.setState({host})
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
        let rootTopic = '/'+username+'/'
        this.setState({username,rootTopic})
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
        console.log(newTopics)
    }
    clearGraph(){
        this.props.clearGraph(this.state.topics)
    }
    handleMQTT(){
        if(client)client.end()
        if(
            this.state.username === '' || 
            this.state.password === '' ||
            this.state.host === '' || 
            this.state.port === '' ||
            this.state.topics.length === 0  
        ) {
          
            this.props.notifications.addNotification({
                title: (<span data-notify="icon" className="pe-7s-close-circle"></span>),
                message: (
                    <div>
                        Please fill out all the input fields
                    </div>
                ),
                level: "error",
                position: 'tc',
                autoDismiss: 5,
            });
            return null;
        }
        console.log('Connecting to MQTT Server ... ')
        this.setState({connected:true})
        // Give out notification 
        this.props.setLoading(true);
        var clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

        var host = "wss://"+this.state.host+":"+this.state.port+'/ws'
        var options = {
            keepalive: 10,
            clientId: clientId,
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            username: this.state.username,
            password: this.state.password,
            rejectUnauthorized: false,
            encoding:"string",
          }
        client = mqtt.connect(host,options)
        var that = this;
    
        client.on('connect', function () {
            // On connection subscribe to the topic and create according axes for the values
            client.subscribe(that.state.topics, function (err,granted) {
             if (!err) {
                that.props.setAxes(that.state.topics)
                that.props.notifications.addNotification({
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
            }
            else{
                that.props.notifications.addNotification({
                    title: (<span data-notify="icon" className="pe-7s-close-circle"></span>),
                    message: (
                        <div>
                            {err.message}
                        </div>
                    ),
                    level: "error",
                    position: 'tc',
                    autoDismiss: 5,
                });
                that.setState({connected:false})
            }
            })
        })
      client.on('error',function(error){
          console.log("Error occured this is the message:",error.message)
          that.props.notifications.addNotification({
            title: (<span data-notify="icon" className="pe-7s-close-circle"></span>),
            message: (
                <div>
                    An Error occured this the error message : {error.message}
                </div>
            ),
            level: "error",
            position: 'tc',
            autoDismiss: 5,
        });
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
            return input !== e.target.name
        })
        let regExp = /[0-9]/g
        let placeInArray = e.target.name.match(regExp)
        
        var newTopics = this.state.topics.filter((topic,index)=>{
            return parseInt(placeInArray) !== index
        })
        this.props.clearGraph([this.state.topics[placeInArray]])
        this.setState({inputs:newInput,topics:newTopics})
    }

    handleRadio = event => {
        const target = event.target;
        this.setState({
            [target.name]: target.value
        });
    };

    dioty(e){
        let checked = e.target.checked
        this.handleRadio(e);
        checked ? this.setState ({
                    host:'mqtt.dioty.co',
                    port:'8080',
                    checkbox:true,
                    rootTopic:'/'+this.state.username+'/'
                        }
                    )
                :  this.setState({
                    host:'',
                    port:'',
                    checkbox:false,
                    
                        }
                    )
        
    }
    sensebox(e){
        let checked;
        if(e.target)
                {
                checked = e.target.checked
                this.handleRadio(e)
                }
        checked || e === 'cdm' ? this.setState({
                    host:'mqtt.sensebox.de',
                    port:'1884',
                    checkbox:true,
                    })
                : this.setState({
                    host:'',
                    port:'',
                    username:'',
                    password:'',
                    checkbox:false
                })
        
    }

    own(e){
        this.handleRadio(e)
        this.setState({
            host:'',
            port:'',
            checkbox:false,
            username:'',
            password:''
        })
        
    }
    render(){
        return(
            <Panel className="margin_panel" bsStyle="success">
            <Collapsible open = {true} trigger = {
                <div onClick={this.handlePanel2} className="panel-heading"> 					
                <h3 className="panel-title collaps-title">Network functionalities</h3>
                 <span className="pull-right clickable"><MdKeyboardArrowDown size={'1.5em'}/></span></div>}>
            <Card 
            content={
            <Grid fluid>
            <Row>
                <Col md = {4}>
                <Radio
                        number="1"
                        option="1"
                        name="radio"
                        onChange={this.sensebox}
                        checked={this.state.radio==="1"}
                        label="Connection through senseBox"
                    />
                </Col>
                <Col md={4}>
                <Radio
                        number="2"
                        option="2"
                        name="radio"
                        onChange={this.dioty}
                        checked={this.state.radio==="2"}
                        label="Connection through dioty.co"
                    />
                </Col>
                <Col md={4}>
                    <Radio 
                        number="3"
                        option="3"
                        name="radio"
                        onChange={this.own}
                        checked={this.state.radio==="3"}
                        label="Setup your own connection"
                    />
                </Col>
            </Row>
                <FormInputs
                    ncols ={["col-md-8","col-md-4"]}
                    proprieties={[
                        {
                            label:"Server address",
                            type:"text",
                            bsClass:"form-control",
                            placeholder:"Server address",
                            defaultValue:this.state.host,
                            onChange:this.changehost,
                            disabled:this.state.checkbox
                        },
                        {
                            label:"Port",
                            type:"text",
                            bsClass:"form-control",
                            placeholder:"Port number",
                            defaultValue:this.state.port,
                            disabled:this.state.checkbox,
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
                            defaultValue:this.state.username,
                            onChange:this.changeusername
                        },
                        {
                            label:"Password",
                            placeholder:"Password",
                            bsClass:"form-control",                                
                            type:"password",
                            defaultValue:this.state.paswword,
                            onChange:this.changepassword
                        }
                    ]}                    
                />
                {this.state.host==='mqtt.dioty.co' ? <FormInputs
                    ncols={["col-md-8"]}
                    proprieties={[
                        {
                            label:"Root topic",
                            type:"text",
                            value:'/'+this.state.username+'/',
                            disabled:true
                        }
                    ]
                }/>
                        :  <div></div>}
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