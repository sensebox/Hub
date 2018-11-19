import React,{Component} from 'react'

/*
    The live page should show live measurements by a sensor
    the visualization will be refreshed everytime a new measurement comes in 
    for the data requests the mqtt-protocoll should be used 


    TODO:
        => Do research on mqtt 
        => set up an mqtt server on raspbian 
        => 'subscrice' to the mqtt server and listen for changes 
        => display these changes in a graph 

*/

class Live extends Component {
    constructor(props){
        super()
        this.state={

        }
    }
    componentDidMount(){
        
    }


    render(){
        return(
            <p> Test </p>
        )
    }
}

export default Live