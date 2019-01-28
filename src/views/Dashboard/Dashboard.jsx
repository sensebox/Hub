import React, { Component, forwardRef, useRef, useImperativeMethods } from "react";
import { Grid, Row, Col ,Panel} from "react-bootstrap";
import 'assets/skins/all.css'
import LiveMeasurements from 'components/Dashboard/LiveMeasurements.jsx'
import StatisticsCard from 'components/Dashboard/StatisticsCard.jsx'

import Radios from 'components/Dashboard/Radios.jsx'
import Dates from 'components/Dashboard/Dates.jsx'
import ReactLoading from 'react-loading';
import ErrorPage from 'components/ErrorPage/ErrorPage.jsx'
var moment = require('moment')

class Dashboard extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading:true,
            loading_stats:true,
            data:[],
            selected:[],
            reload:false,
        }
        this.updateSelection = this.updateSelection.bind(this);
        this.onChangeFrom = this.onChangeFrom.bind(this);
        this.onChangeTo = this.onChangeTo.bind(this);
        this.submitStats = this.submitStats.bind(this);
    }
    
    componentDidMount(){
        this.getBox();
    }

    getBox(){
        let url = 'https://api.opensensemap.org/boxes/'+this.props.match.params.id;
        fetch(url)
        .then((response)=>{
            if(response.ok){
                return response.json()
            }
            this.setState({error:true,errorMessage:"False Box id(420)"})
            throw new Error("False box id")
        })
        .then((json)=>{
            this.setState({
                senseBox:json,
                sensors:json.sensors,
                loading:false
            })
        })
        .then(()=>{
            this.state.sensors.map((sensor)=>{
                this.getStatistics(sensor._id,sensor.title);
            })
        })
        .catch(function(error){
            //this.setState({error:true})

            console.log('Error: ', error)
        })
    }

    getStatistics(sensorid,title){
        let url = "https://api.opensensemap.org/boxes/"+this.props.match.params.id+ "/data/"+sensorid
        fetch(url)
        .then((response)=>{
            if(response.ok)
                return response.json()
            throw new Error(response.message)
        })
        .then((json)=>{
            this.setState((prevState)=>{
                data:prevState.data.push({
                    typ:title,data:json})})
        })
        .then(()=>{
            if(this.state.data.length === this.state.sensors.length){
                console.log(this.state.data)
                this.setState({
                    selected:[this.state.data[0].typ,this.state.data[1].typ],
                    loading_stats:false,
                    from:moment(this.state.data[0].data[this.state.data[0].data.length-1].createdAt).format('YYYY-MM-DD'),
                    to:moment(this.state.data[0].data[0].createdAt).format('YYYY-MM-DD'),

                })
            }}
        )
        .catch((function(error){
            this.setState({error:true,errorMessage:error.message})
            console.log('Error', error.message)
        }))
    }

    updateSelection(e){
        const checked = e.target.checked
        const id = e.target.id
        let newSelected = this.state.selected;
       if(!checked){
            newSelected = newSelected.filter((sensor)=>{
                return sensor !=id
            })
        }
        else{
            newSelected.push(id)   
        }
        this.setState({selected:newSelected})
    
    }

    onChangeFrom(e){
        var newDate = e.target.value ;
        this.setState({
            from:newDate 
        })
    }
    onChangeTo(e){
        var newDate = e.target.value;
        this.setState({
            to:newDate
        })
    }
    submitStats(){
        this.refs.Stats.myRef.current.chart.showLoading();
        this.setState({
            data:[]
        },function(){
            this.state.sensors.map((sensor)=>{
                let url ="https://api.opensensemap.org/statistics/descriptive?boxId=5a30ea5375a96c000f012fe0&phenomenon="+
            sensor.title+"&from-date="+this.state.from+"T00:00:00.032Z&to-date="+this.state.to+"T23:59:00.032Z&operation=arithmeticMean"+
            "&window=300000&format=json" 
            fetch(url)
            .then((response)=>{
                if(response.ok)
                    return response.json()
                this.setState({
                    hasError:"no measurement"
                })
                throw new Error('Box has no measurements to fetch')
            })
            .then((json)=>{
                var dataArray = []
                for(var measurement in json[0]){
                    if(measurement === "sensorId") continue 
                    dataArray.push({value:json[0][measurement],createdAt:measurement})
                }
                dataArray = dataArray.reverse();
                let toPush = this.state.data;
                toPush.push({typ:sensor.title,data:dataArray})
                this.setState({
                    data:toPush,
                },function(){
                    if(this.state.sensors.length === this.state.data.length)
                        this.refs.Stats.reloadGraph();
                })
            })
            })
        })

        
    }
    render(){
        if(this.state.error){
            return(
                <ErrorPage message={this.state.errorMessage}/>
                )}
        return(            
            <Grid fluid>
                <Row>
                    <Col md={12}>
                        <LiveMeasurements loading = {this.state.loading} sensors = {this.state.sensors}/>
                    </Col>
                </Row>
                <Row>
                    {this.state.loading_stats ? 
                    <div>
                    <ReactLoading className="centered" type="balls" color="#4EAF47" width={100}/> 
                    <h3 className="centered_text">Loading Stats</h3>
                    </div>
                    :
                    <div>
                    <Col md={10}>
                            <StatisticsCard ref="Stats" reload={this.state.reload} selected={this.state.selected} from = {this.state.from} to = {this.state.to} data = {this.state.data}/>           
                    </Col>
                    <Col md={2}>
                     <Radios selected={this.state.selected} updateSelection={this.updateSelection} sensors = {this.state.sensors}/>
                    
                    </Col>
                    <Col md={2}>
                        <Dates submitStats={this.submitStats} onChangeFrom={this.onChangeFrom} onChangeTo={this.onChangeTo} from={this.state.from} to={this.state.to}/>
                    </Col>
                    </div>
                }
                    
                </Row>
            </Grid>
        )
    }
}

export default Dashboard