import React, { Component,  forwardRef, useRef, useImperativeMethods } from "react";
import { Grid, Row, Col ,Panel} from "react-bootstrap";
import { Card } from "components/Card/Card.jsx";

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


var moment = require('moment')
// Options variable that is needed for Highcharts
const options = {
    title: {
      text: ''
    },
    loading: {
      labelStyle : {
          fontStyle:'roboto'
      },
      hideDuration: 1000,
      showDuration: 1000
      },
      chart:{
          zoomType:'x',
          height:650
      }
  }

  
class StatisticsCard extends Component {
    constructor(props){
        super(props)
        this.myRef = React.createRef();
        this.state = {
            loading:true,
            opposite:true
        }
    }
    componentDidMount(){
        this.startInitial();
    }
    componentDidUpdate(){
        this.checkForNewSeries();
        if(this.props.reload){this.reloadGraph()}
    }
    

    checkForNewSeries(){
        let chart = this.myRef.current.chart
        let activeSeries = [];
        
        for(let i = 0;i<chart.series.length;i++){
            activeSeries.push(chart.series[i].getName())
        }
        
        if(chart.series.length === this.props.selected.length){
            return
        }
        if(chart.series.length > this.props.selected.length){
            // remove one series
            for(let i = 0;i < chart.series.length;i++){
                if(this.props.selected.includes(chart.series[i].getName())){
                    continue
                }
                this.removeSeries(chart.series[i].getName());
            }
        }
        if(chart.series.length < this.props.selected.length){
            // add a series 
            for(let i = 0;i<this.props.selected.length;i++){
                if(activeSeries.includes(this.props.selected[i])){
                    continue
                }
                this.addSeries(this.props.selected[i],this.state.opposite)
            }


        }
        
    }
    addSeries(title,opposite) {
        // init Variables 
        
        let chart = this.myRef.current.chart
        var arr = this.createSeries(this.props.data);
        var toAdd = arr.filter((sensor)=>{
            return sensor.typ === title
        })
        
        chart.addAxis({
            id:title+"_axis",
            title:{
                text:title
            },
            opposite:opposite
        })
        chart.addSeries({
            name:title,
            id:title,
            typ:"spline",
            data:toAdd[0].data,
            yAxis:title+"_axis"
        })
        this.setState({
            opposite:!opposite
        })
    }

    removeSeries(title){
        let chart = this.myRef.current.chart
        chart.get(title).remove();
        chart.get(title+"_axis").remove(); 
    }
    createSeries(data){
        var arr = []
        for(let i=0;i<data.length;i++){
            var newArr = {typ:data[i].typ,data:[]}
            for(let u=data[i].data.length-1;u>=0;u--){
                newArr.data.push(parseFloat(data[i].data[u].value))
            }
            arr.push(newArr)
        }
        return arr;
    }

    createXAxis(data){

        const length = data[0].data.length;
       // const to = moment(data[0].createdAt).format('YYYY-MM-DD')
       // const from = moment(data[length-1].createdAt).format('YYYY-MM-DD')
        
        var dateArray = []
        data[0].data.map((measurement)=>{
            dateArray.push(moment(measurement.createdAt).format("DD.MM.YYYY HH:mm"))
        })
        dateArray = dateArray.reverse()

        

        return dateArray
    }

    addXAxis(data){
        var xAxis = this.createXAxis(data);
        let chart = this.myRef.current.chart
        chart.setTitle({
            text:"senseBox"
        })
        chart.xAxis[0].remove(); // make sure that only one xAxis exists at a time
        chart.addAxis({
            tickInterval:Math.floor(xAxis.length/12),
            categories:xAxis
        },true)
    }
    reloadGraph(){
        let chart = this.myRef.current.chart
        for(let i=0;i<this.props.selected.length;i++){
            this.removeSeries(this.props.selected[i]);
        }
        this.addXAxis(this.props.data)
        for(let i=0;i<this.props.selected.length;i++){
            this.addSeries(this.props.selected[i],this.state.opposite)
        }
        chart.hideLoading();

    }
    startInitial(){
        let chart = this.myRef.current.chart;
        var arr = this.createSeries(this.props.data);
        this.addXAxis(this.props.data);
        const seriesToAdd = 2;
        let opposite = false;
        for(var i = 0;i<seriesToAdd;i++){
            chart.addAxis({
                id:arr[i].typ+"_axis",
                title:{
                    text:arr[i].typ
                },
                opposite:opposite
            })
            chart.addSeries({
                name:arr[i].typ,
                id:arr[i].typ,
                typ:"spline",
                data:arr[i].data,
                yAxis:arr[i].typ+"_axis"
            })
            opposite=!opposite;
        }
    }
    render(){
        return( 
            <Card
                id="chartHours"
                title="Statistik"
                content={
                    <HighchartsReact
                    highcharts={Highcharts}
                    options={options}
                    ref={this.myRef}
                    />
            }/>
        )
    }
}

export default StatisticsCard