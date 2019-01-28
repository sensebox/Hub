import React, { Component } from 'react'
import Collapsible from 'react-collapsible';
import { StatsCard } from "components/StatsCard/StatsCard.jsx";
import { Grid, Row, Col ,Panel} from "react-bootstrap";

import ReactLoading from 'react-loading';

class LiveMeasurements extends Component {
    constructor(props){
        super(props)
        this.state = {

        }
    }



    render(){
        if(this.props.loading){
            return(
                <div>
                <ReactLoading className="centered" type="balls" color="#4EAF47" width={100}/> 
                <h3 className="centered_text">Fetching Box</h3>
                </div>
            )
        }
        return(
            <Panel bsStyle="success" trigger={
                <div ońClick = {this.handlePanel} className="panel-heading">
                    <h3 className="panel-title clickable collaps-title">Live measurements</h3>
                    <span className="pull-right clickable"><i className={this.state.panel}></i></span>
                </div>}>
                <div className="panel-body">
                    {this.props.sensors.map((sensor)=>(
                        <Col key={sensor._id} lg={3} md={6}>
                            <StatsCard
                                bigIcon={
                                    <div className="radio_group">
                                    
                                    </div>}
                                statsIconText = {sensor.lastMeasurement.createdAt} statsText={sensor.title}
                                statsValue={sensor.lastMeasurement.value+" "+sensor.unit}/>
                        </Col>
                    ))}
                </div>
            </Panel>
        )
    }
}

export default LiveMeasurements