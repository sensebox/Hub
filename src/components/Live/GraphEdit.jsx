import React,{Component} from 'react'
import {Grid,Row,Col,FormControl,ControlLabel,FormGroup,Panel} from 'react-bootstrap'
import Card from 'components/Card/Card'
import Collapsible from 'react-collapsible';
import {MdKeyboardArrowDown,MdKeyboardArrowUp} from 'react-icons/md'
import {FormInputs} from 'components/FormInputs/FormInputs.jsx'


class GraphEdit extends Component{
    constructor(props){
        super(props)
        this.state = {
            toggle : false
        }
        this.clickHandler = this.clickHandler.bind(this)
        this.changeMax = this.changeMax.bind(this)
        this.changeMin = this.changeMin.bind(this)
        this.setExtremes = this.setExtremes.bind(this)
    }
    
    clickHandler(e){
        console.log(this.state.toggle)
        // this.setState((prevState)=>{
        //     toggle:  !prevState.toggle
        // })
    
    }
    changeMax(e){
        let name = e.target.name + '_max'
        let value = e.target.value
        this.setState({
            [name]:value
        })
    }
    changeMin(e){
        let name = e.target.name + '_min'
        let value = e.target.value
        this.setState({
            [name]:value
        })
    }

    setExtremes(e){
        let topic = e.target.name
        let min = this.state[topic+'_min']
        let max = this.state[topic+'_max']
        // Call function in parent
        this.props.setExtremes(topic,min,max)
    }


    render(){
        return(
            <Panel className="margin_panel" bsStyle="success">
                <Collapsible onClick={this.clickHandler} trigger = {
                    <div onClick={this.handlePanel1} className="panel-heading"> 					
                    <h3 className="panel-title collaps-title">Configure the graph</h3>
                    <span  className="pull-right clickable">
                        {this.state.toggle ? 
                        <MdKeyboardArrowUp size={'1.5em'}/>
                        :<MdKeyboardArrowDown size={'1.5em'}/>

                        }             
                        </span></div>}>
            <Card 
                content={
                    <Grid className="no-width">
                        <FormInputs
                            ncols={["col-md-12"]}
                            proprieties={[
                                {
                                    label:"Change title",
                                    type:"text",
                                    defaultValue:"Live Messwerte",
                                    onChange:this.props.setTitle
                                }
                            ]}
                        />
                    <ControlLabel>Change the extremes of the shown y-Axes</ControlLabel>
                    <Row>
                    {this.props.topics.map((topic,index)=>{
                                return(
                                <Col md = {2} key = {index}>
                                <FormGroup>
                                    <ControlLabel>{topic}</ControlLabel>
                                    <FormControl
                                        name={topic}
                                        bsSize="sm"
                                        type ="number"
                                        placeholder="Scale"
                                        onChange = {this.changeMin}
                                    />  
                                    <FormControl
                                        name={topic}
                                        bsSize="sm"
                                        type ="number"
                                        placeholder="Scale"
                                        onChange = {this.changeMax}
                                        />
                                    <FormControl
                                        bsSize ="sm"
                                        name={topic}
                                        type="submit"
                                        value="Set Extremes"
                                        onClick={this.setExtremes}
                                    /> 
                                </FormGroup>
                                </Col>
                                )
                            })}
                            
                    </Row>
                    </Grid>
                }/>
                </Collapsible>
            </Panel>
        )
    }
}

export default GraphEdit