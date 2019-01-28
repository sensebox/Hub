import React, { Component } from 'react'
import {FormInputs} from 'components/FormInputs/FormInputs.jsx'
import { Card } from "components/Card/Card.jsx";


class Dates extends Component{
    constructor(props){
        super(props)
        this.state={
        }
    }

    componentDidUpdate(){
    }

    render(){
        return(
            <Card 
            title="Choose a date"
            category="Select time frame for the statistics"
            content={
              <FormInputs
                ncols={["col-md-12","col-md-12","col-md-12"]}
                proprieties = {[
                    {
                        label:"From",
                        id:"from",
                        type:"date",
                        bsClass:"form-control",
                        defaultValue:this.props.from,
                        onChange:this.props.onChangeFrom,
                        max:this.props.to,
                    },
                    {
                        label:"To",
                        id:"to",
                        type:"date",
                        bsClass:"form-control",
                        defaultValue:this.props.to,
                        onChange:this.props.onChangeTo,
                        min:this.props.from
                    },
                    {
                        label:"Submit",
                        type:"button",
                        bsClass:"form-control",
                        value:"Submit new dates",
                        onClick:this.props.submitStats
                    }
                ]}
              />
            }
        />
        )
    }
}

export default Dates