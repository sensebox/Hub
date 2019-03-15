import React, { Component } from "react";
import { Grid, Row, Col, Button, FormControl, Carousel } from "react-bootstrap";
import {Link} from 'react-router-dom'
import img from 'assets/img/banner.jpg'
import img2 from 'assets/img/stats.png'
import img3 from 'assets/img/stats2.png'
import 'assets/sass/custom.css'
import NotificationSystem from 'react-notification-system';
import {style} from "variables/Variables.jsx";

class Go extends Component {
    constructor(props){
        super(props)
        console.log(props);
        this.state={
            input:'5a30ea5375a96c000f012fe0',
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
            <Col md={2}>
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
                <Col md ={6}>
                <Link to={`/sensebox/${ this.state.input }`}>           
                <Button bsStyle="success" onClick={this.handleSubmit}>Load senseBox</Button>
                </Link>
                </Col>
                </Row>
            </Col>
            <Col md={10}> 
            <Carousel width="2000" height="1000">
                <Carousel.Item>
                    <img alt="senseBoxGo" className="d-block w-100" width="100%" height="100%" src={img}/>
                    <Carousel.Caption>
                        {/*  eslint-disable-next-line */}
                    <h3 style={{'color':'black'}}></h3>
                </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img alt="senseBoxDashboard" width="100%" height="100%" className="d-block w-100" src={img2}/>
                    <Carousel.Caption>
                    <h3 style={{'color':'black'}}>Look at stats</h3>
                 </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img alt="senseBoxDashGo" width="100%" height="100%" className="d-block w-100" src={img3}/>
                    <Carousel.Caption>
                    <h3 style={{'color':'black'}}>...or live measurements</h3>
                </Carousel.Caption>
                </Carousel.Item>
            </Carousel>
            </Col>
        </Grid>
        )
    }


}
export default Go