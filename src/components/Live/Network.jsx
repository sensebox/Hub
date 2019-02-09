import React,{Component} from 'react'
import {Grid,Row,Col,FormControl,ControlLabel,FormGroup,Panel,Button} from 'react-bootstrap'
import Card from 'components/Card/Card'
import Collapsible from 'react-collapsible';
import {MdKeyboardArrowDown} from 'react-icons/md'

class Network extends Component{
    constructor(props){
        super(props)
        this.state = {
            ip:'10.0.1.2',
            key:'',
            topics:[]
        }
        this.changeip = this.changeip.bind(this)
        this.changekey = this.changekey.bind(this)
        this.changetopic = this.changetopic.bind(this)
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
                    <Button bsStyle="success">Connect to MQTT</Button>

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