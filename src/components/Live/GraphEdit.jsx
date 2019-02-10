import React,{Component} from 'react'
import {Grid,Row,Col,FormControl,ControlLabel,FormGroup,Panel} from 'react-bootstrap'
import Card from 'components/Card/Card'
import Collapsible from 'react-collapsible';
import {MdKeyboardArrowDown,MdKeyboardArrowUp} from 'react-icons/md'

class GraphEdit extends Component{
    constructor(props){
        super(props)
        this.state = {
            toggle : false
        }
        this.clickHandler = this.clickHandler.bind(this)
    }

    clickHandler(e){
        console.log(this.state.toggle)
        this.setState((prevState)=>{
            toggle:!prevState.toggle
        })
    
    }
    changeMax(e){
        console.log(e.current.target)
    }
    changeMin(e){
        console.log(e.current.target)
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
                    category = "Set minimum and maxium for the yAxis"
                    content={
                        <Grid>
                        <Row>
                            <FormGroup>
                                <ControlLabel>Change title</ControlLabel>
                                <FormControl
                                    bsSize="sm"
                                    type ="text"
                                    defaultValue="Live Messwerte"
                                    placeholder="Set new title"
                                    onChange={this.props.setTitle}
                                    />
                            </FormGroup>
                        </Row>
                        <Row >
                        <Col md={6} className="smi">
                            <FormGroup>
                                <ControlLabel>Topics len </ControlLabel>
                            <FormControl
                                    bsSize="sm"
                                    type ="number"
                                    value="Topic1"
                                    placeholder="Scale"
                                    onChange = {this.changeMin}
                                    />
                            <FormControl
                                    bsSize="sm"
                                    type ="number"
                                    value="100"
                                    placeholder="Scale"
                                    onChange = {this.changeMax}
                                    />     
                            <FormControl
                                bsSize ="sm"
                                type="button"
                                value="Set scale for first yAxis"
                                />
                            </FormGroup>
                            </Col>
                        </Row>
                        </Grid>
                    }/>
                </Collapsible>
            </Panel>
        )
    }
}

export default GraphEdit