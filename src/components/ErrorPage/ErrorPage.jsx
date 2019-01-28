import React, { Component } from "react";
import {Link} from 'react-router-dom'


class ErrorPage extends Component{
    constructor(props){
        super(props)
        this.state={

        }
    }
    render(){
        return(
        <div className="error-card ">
            <h1 className="error sensegreen">Error!</h1>
            <h1 className="error_subtitle sensegreen">😵 Oh no!</h1>
            <hr width="50%" className="error_hr"></hr>
            <h1 className="sensegreen">The error message was: {this.props.message} </h1>
            <h2 className="sensegreen">Please include this error message when reffering to this page</h2>
            <h2 className="sensegreen">Please try again! <Link to='/dashboard'>Click here to go back!</Link></h2>
        </div>
        )
    }
}

export default ErrorPage