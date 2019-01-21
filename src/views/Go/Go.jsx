import React, { Component } from "react";
import { Grid, Row, Col, Button, FormControl } from "react-bootstrap";
import {Link} from 'react-router-dom'
import img from 'assets/img/banner.jpg'
import 'assets/sass/custom.css'
import NotificationSystem from 'react-notification-system';
import {style} from "variables/Variables.jsx";

class Go extends Component {
    constructor(props){
        super(props)
        console.log(props);
        this.state={
            input:'5bb610bf043f3f001b6a4c53',
            json:[],
            loading:true,
            _notificationSystem: null,

        }
        this.handleInput = this.handleInput.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    componentDidMount(){
        this.setState({_notificationSystem: this.refs.notificationSystem})
    }
    handleInput(e){
        this.setState({
            input:e.target.value
        })
        
    }
    handleClick(position){
        var level = 'success'; // 'success', 'warning', 'error' or 'info'
        this.state._notificationSystem.addNotification({
            title: (<span data-notify="icon" className="pe-7s-gift"></span>),
            message: (
                <div>
                    Welcome to <b>Light Bootstrap Dashboard</b> - a beautiful freebie for every web developer.
                </div>
            ),
            level: level,
            position: position,
            autoDismiss: 15,
        });
    }


  
    render(){
        return(
        <Grid fluid>
            <NotificationSystem ref="notificationSystem" style={style}/>
            <img alt="senseBoxGo" className="image_header_go" src={img}></img>
            <Row style={{'marginLeft':0}}>
                <h1>Welcome to the Dashboard<br></br>
                    <small>Please enter your senseBox-ID</small>
                </h1>
            </Row>
            <Row>
            <Col md={6}>   
            <FormControl
            type="text"
            placeholder="senseBoxID"
            onChange={this.handleInput}
            />
            </Col>
            <Col md={6}> 
            <Link to={`/sensebox/${ this.state.input }`}>           

            <Button bsStyle="success" onClick={this.handleSubmit}>Load senseBox</Button>
            </Link>
            </Col>

            </Row>

        </Grid>
        )
    }


}
export default Go