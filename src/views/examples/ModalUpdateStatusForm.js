import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import {
    Col, Form,
    FormGroup, Label, Input,Alert
  } from 'reactstrap';
import axios from 'axios';
import LoadingOverlay from 'react-loading-overlay';
import makeAnimated from 'react-select/animated';
import Select from 'react-select'

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
export default class ModalUpdateStatusForm extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            status:'',
            statusValid:false,
            isActiveForm:false,
            formErrors:{
                status:'',
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
        let statusValid=this.state.statusValid;
        switch(fieldName) {
          case 'status':
            statusValid = value.length>0
            fieldValidationErrors.status = statusValid ? '': 'Status Entered is Invalid. Please Check'
            break;
         default:
            break;
        }
        this.setState({formErrors: fieldValidationErrors,
            statusValid: statusValid,
          }, this.validateForm);
    }

    validateForm() {
        this.setState({formValid: this.state.statusValid});
            }

    onStatusChange(event){
        this.setState({
            status:event
        },
        ()=>{this.validateField('status',this.state.status.value)}
        )
    }
    onSubmitClick(){
        let me = this
        me.setState({
            isActiveForm:true
        })
        const data ={
          key: "Status",
          value: this.state.status.value,
          projectName: this.props.projectName,
          type:"S"
        }
    
        axios({
          method:'post',
          url:'/update_project_details/',
          data:JSON.stringify({data}),
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
        let {modalOpen,className,projectName} = this.props
        let {isError, isActiveForm} = this.state
        const options = [
            { value: 'Pending', label: 'Pending' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Delayed', label: 'Delayed' },
            { value: 'On-Schedule', label: 'On-Schedule' }
          ]
        return (
            <div>
                <Modal isOpen={modalOpen} toggle={this.props.setModal} className={className}>
                <LoadingOverlay
                            active={isActiveForm}
                            spinner
                            text='Updating Status...'
                            >
                    <ModalHeader>  Update Status for Project - {projectName}</ModalHeader>


                    <Form style ={{marginLeft: "20px", width: "624px"}}>
                    {isError==true?<Alert style={{width:"50%"}} color="warning" isOpen={isError} toggle={()=>{this.onDismiss(this)}}>
                          There was an Error in data
                        </Alert>:null}

                        <FormGroup row>
                        <Label sm={4}>Status</Label>
                        <Col>
                        <Select options={options}
                                components={animatedComponents}
                                closeMenuOnSelect={true}
                                value={this.state.status}
                                onChange={(event)=>{this.onStatusChange(event)}}
                                className="w-50"
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
