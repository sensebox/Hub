import React, { Component } from 'react'
import { Card } from "components/Card/Card.jsx";
import Checkbox from 'components/CustomCheckbox/CustomCheckbox';

class Radios extends Component{
    constructor(props){
        super(props);
        this.state={

        }
    }
    componentDidMount(){

    }
    render(){
        return(
            <Card 
                title="Sensors to choose"
                category="Check sensor to add"
                content={
                    <ul>
                        {this.props.sensors.map((sensor)=>{
                            let checked = false;
                            if(sensor.title === this.props.selected[0] || sensor.title === this.props.selected[1]) checked = true;
                            return(
                                <li className="sensors" key={sensor._id}>
                                    <Checkbox
                                        number={sensor.title}
                                        label={sensor.title}
                                        isChecked={checked}
                                        onClick={e=>this.props.updateSelection(e)}
                                        />
                                </li>
                            )
                        })}
                    </ul>
                }/>
        )
    }
}

export default Radios