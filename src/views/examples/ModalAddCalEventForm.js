import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import Select from 'react-select'
import {
    Col, Form,
    FormGroup, Label, Input,Alert
  } from 'reactstrap';
import makeAnimated from 'react-select/animated';
import axios from 'axios';
import DatePicker from "react-datepicker";
import LoadingOverlay from 'react-loading-overlay';

import "react-datepicker/dist/react-datepicker.css";

const animatedComponents = makeAnimated();


const FormErrors = ({formErrors}) =>
  <div className='formErrors'>
    {Object.keys(formErrors).map((fieldName, i) => {
      if(formErrors[fieldName].length > 0){
        return (
          <p key={i} style={{color:"red"}}>{formErrors[fieldName]}</p>
        )        
      } else {
        return '';
      }
    })}
  </div>
export default class ModalAddExpenseForm extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            endDate:new Date(),
            endDateValid:false,
            startDate:new Date(),
            startDateValid:false,
            eventName:'',
            isError:false,
            isActiveForm:false,
            formErrors:{
                startDate:'',
                endDate:'',
                eventName:'',
            }
        }
        this.onDismiss=this.onDismiss.bind(this)
    }
    
    onDismiss(me){
        me.setState({
          isError:false,
        })
      }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;

        let startDateValid= this.state.startDateValid;
        let endDateValid= this.state.endDateValid;

        let eventNameValid= this.state.eventName;
        switch(fieldName) {
          case 'eventName':
              eventNameValid = value.length > 0
              fieldValidationErrors.eventName = eventNameValid ? '':'Please Enter event Name'
              break;
          case 'startDate':
            startDateValid = value instanceof Date 
            fieldValidationErrors.startDate = startDateValid?'':'Please Enter Start Date'
            break;
          case 'endDate':
            endDateValid = value instanceof Date 
            fieldValidationErrors.endDate = endDateValid?'':'Please Enter End Date'
            break;
          default:
            break;
        }
        this.setState({formErrors: fieldValidationErrors,
            endDateValid: endDateValid,
            startDateValid: startDateValid,
            eventNameValid: eventNameValid,
          }, this.validateForm);
    }

    validateForm() {
        this.setState({formValid: this.state.eventNameValid && this.state.endDateValid && 
                                  this.state.startDateValid});
            }

    onStartDateChange(event){
        this.setState({
          startDate:event
        },()=>{this.validateField('startDate', this.state.startDate)}
        )
      }

      onEndDateChange(event){
        this.setState({
          endDate:event
        },()=>{this.validateField('endDate', this.state.endDate)}
        )
      }

    onEventNameChange(event){
        this.setState({
            eventName:event.target.value
        },
        ()=>{this.validateField('eventName', this.state.eventName)}
        )
    }
    onSubmitClick(){
        let me = this
        me.setState({
            isActiveForm:true
        })
        const event ={
          startDate: this.state.startDate.toISOString(),
          endDate: this.state.endDate.toISOString(),
          eventName: this.state.eventName,
        }
    
        axios({
          method:'post',
          url:'/add_calendar_event/',
          data:JSON.stringify({event}),
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
          },
        }).then(res => {
            me.props.onSuccess()
            me.props.setModal()
            me.setState({
                isActiveForm:false
            })
        }).catch(error => {
            me.setState({
                isError:true,
                isActiveForm:false
              })
          console.log(error.response)
      });
      }
      onCloseClick=()=>{
        this.props.setModal()
      }
    
    render() {
        let {modalOpen,className} = this.props
        let {isError, isActiveForm} = this.state
        return (
            <div>
                <Modal isOpen={modalOpen} toggle={this.props.setModal} className={className}>

                <LoadingOverlay
                            active={isActiveForm}
                            spinner
                            text='Adding Event to the Calendar(Reload again to see events in the list)...'
                            >
                    <ModalHeader>  Add Event to the Calendar </ModalHeader>


                    <Form style ={{marginLeft: "20px", width: "624px"}}>
                    {isError==true?<Alert style={{width:"50%"}} color="warning" isOpen={isError} toggle={()=>{this.onDismiss(this)}}>
                          There was an Error in data
                        </Alert>:null}
                        <FormGroup row>
                        <Label sm={4}>Start Date</Label>
                        <Col style={{width:'50%'}}>
                        <DatePicker
                            className="w-20"
                            id="date"
                            showTimeSelect
                            placeholder="Select Start Date"
                            selected={this.state.startDate}
                            onChange={(event)=>{this.onStartDateChange(event)}}
                            dateFormat="dd/MM/yyyy h:mm aa"

                        />
                        </Col>
                        </FormGroup>

                        <FormGroup row>
                        <Label sm={4}>End Date</Label>
                        <Col style={{width:'50%'}}>
                        <DatePicker
                            className="w-20"
                            id="date"
                            showTimeSelect
                            placeholder="Select End Date"
                            selected={this.state.endDate}
                            onChange={(event)=>{this.onEndDateChange(event)}}
                            dateFormat="dd/MM/yyyy h:mm aa"
                        />
                        </Col>
                        </FormGroup>

                        <FormGroup row>
                        <Label sm={4}>Event Name</Label>
                        <Col>
                        <Input
                            className="w-50"
                            type="purpose"
                            name="purpose"
                            id="purpose"
                            placeholder="----"
                            value={this.state.eventName}
                            onChange={(event)=>{this.onEventNameChange(event)}}
                            className="w-50"

                            // style = {{width:"30%"}}
                        />
                        </Col>
                        </FormGroup>
 
                    <div className="panel panel-default">
                        < FormErrors formErrors={this.state.formErrors} />
                    </div>
                    </Form>
                    <ModalFooter>
                    <Button color="primary" disabled={!this.state.formValid} onClick={()=>{this.onSubmitClick()}}>Submit</Button>{' '}
                    <Button color="secondary" onClick={()=>{this.onCloseClick()}}>Close</Button>
                    </ModalFooter>
                    </LoadingOverlay>
                </Modal>
            </div>
        )
    }
}
