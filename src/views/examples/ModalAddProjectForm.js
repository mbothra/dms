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
export default class ModalAddProjectForm extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            projectName:'',
            projectNameValid:false,
            budget:'',
            budgetValid:false,
            // status:'',
            // statusValid:false,
            user:'',
            userValid:false,

            isActiveForm:false,
            formErrors:{
                projectName:'',
                budget:'',
                // status:'',
                user:''
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
        let projectNameValid=this.state.projectNameValid;
        let budgetValid=this.state.budgetValid;
        // let statusValid=this.state.statusValid;
        let userValid=this.state.userValid;

        switch(fieldName) {
          case 'projectName':
            projectNameValid = value.length>0
            fieldValidationErrors.projectName = projectNameValid ? '': 'Project Name Entered is Invalid. Please Check'
            break;
        case 'budget':
            budgetValid = !(isNaN(value))
            fieldValidationErrors.budget = budgetValid ? '': 'Budget Entered is Invalid. Please Check'
            break;
        // case 'status':
        //     statusValid = value.length>0
        //     fieldValidationErrors.status = statusValid ? '': 'Status Entered is Invalid. Please Check'
        //     break;
        case 'user':
            userValid = value.length>0
            fieldValidationErrors.user = userValid ? '': 'User Entered is Invalid. Please Check'
            break;
         default:
            break;
        }
        this.setState({formErrors: fieldValidationErrors,
            projectNameValid: projectNameValid,
            budgetValid: budgetValid,
            // statusValid: statusValid,
            userValid: userValid,
          }, this.validateForm);
    }

    validateForm() {
        this.setState({formValid: this.state.budgetValid && this.state.projectNameValid 
            // && this.state.statusValid
                        && this.state.userValid});
            }

    onProjectNameChange(event){
        this.setState({
            projectName:event.target.value
        },
        ()=>{this.validateField('projectName',this.state.projectName)}
        )
    }
    onBudgetChange(event){
        this.setState({
            budget:event.target.value
        },
        ()=>{this.validateField('budget',this.state.budget)}
        )
    }
    onStatusChange(event){
        this.setState({
            status:event
        },
        ()=>{this.validateField('status',this.state.status.value)}
        )
    }
    onUserChange(event){
        this.setState({
            user:event.target.value
        },
        ()=>{this.validateField('user',this.state.user)}
        )
    }
    onSubmitClick(){
        let me = this
        me.setState({
            isActiveForm:true
        })

        const project ={
            project_name: this.state.projectName,
            budget: Number(this.state.budget),
            // status: this.state.status.value,
            users: this.state.user,
            progress:0
        }
    
        axios({
            method:'post',
            url:'/add_project/',
            data:JSON.stringify({project}),
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
                            text='Adding Project...'
                            >
                    <ModalHeader> Enter Project Details </ModalHeader>


                    <Form style ={{marginLeft: "20px", width: "624px"}}>
                    {isError==true?<Alert style={{width:"50%"}} color="warning" isOpen={isError} toggle={()=>{this.onDismiss(this)}}>
                          There was an Error in data
                        </Alert>:null}

                        <FormGroup row>
                        <Label sm={4}>Project Name</Label>
                        <Col>
                        <Input
                            type="projectName"
                            name="projectName"
                            id="projectName"
                            value={this.state.projectName}
                            onChange={(event)=>{this.onProjectNameChange(event)}}
                            className="w-50"

                        />
                        </Col>
                        </FormGroup>

                        <FormGroup row>
                        <Label sm={4}>Budget (in INR)</Label>
                        <Col>
                        <Input
                            type="budget"
                            name="budget"
                            id="budget"
                            value={this.state.budget}
                            onChange={(event)=>{this.onBudgetChange(event)}}
                            className="w-50"

                        />
                        </Col>
                        </FormGroup>
                        {/* <FormGroup row>
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
                        </FormGroup> */}
                        <FormGroup row>
                        <Label sm={4}>User Name</Label>
                        <Col>
                        <Input
                            type="user"
                            name="user"
                            id="user"
                            value={this.state.user}
                            onChange={(event)=>{this.onUserChange(event)}}
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
