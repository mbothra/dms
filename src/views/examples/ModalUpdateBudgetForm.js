import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import {
    Col, Form,
    FormGroup, Label, Input,Alert
  } from 'reactstrap';
import axios from 'axios';
import LoadingOverlay from 'react-loading-overlay';

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
export default class ModalUpdateBudgetForm extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            budget:'',
            budgetValid:false,
            isActiveForm:false,
            formErrors:{
                budget:'',
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
        let budgetValid=this.state.budgetValid;
        switch(fieldName) {
          case 'budget':
            budgetValid = !(isNaN(value))
            fieldValidationErrors.budget = budgetValid ? '': 'Budget Entered is Invalid. Please Check'
            break;
         default:
            break;
        }
        this.setState({formErrors: fieldValidationErrors,
            budgetValid: budgetValid,
          }, this.validateForm);
    }

    validateForm() {
        this.setState({formValid: this.state.budgetValid});
            }

    onBudgetChange(event){
        this.setState({
            budget:event.target.value
        },
        ()=>{this.validateField('budget',this.state.budget)}
        )
    }
    onSubmitClick(){
        let me = this
        me.setState({
            isActiveForm:true
        })
        const data ={
          key: "Budget",
          value: this.state.budget,
          projectName: this.props.projectName,
          type:'N'
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
        return (
            <div>
                <Modal isOpen={modalOpen} toggle={this.props.setModal} className={className}>
                <LoadingOverlay
                            active={isActiveForm}
                            spinner
                            text='Updating Budget...'
                            >
                    <ModalHeader>  Update Budget for Project - {projectName}</ModalHeader>


                    <Form style ={{marginLeft: "20px", width: "624px"}}>
                    {isError==true?<Alert style={{width:"50%"}} color="warning" isOpen={isError} toggle={()=>{this.onDismiss(this)}}>
                          There was an Error in data
                        </Alert>:null}

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
