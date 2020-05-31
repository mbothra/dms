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
            user:'',
            userValid:false,
            isActiveForm:false,
            formErrors:{
                user:'',
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
        let userValid=this.state.userValid;
        switch(fieldName) {
          case 'user':
            userValid = value.length>0
            fieldValidationErrors.user = userValid ? '': 'User Entered is Invalid. Please Check'
            break;
         default:
            break;
        }
        this.setState({formErrors: fieldValidationErrors,
            userValid: userValid,
          }, this.validateForm);
    }

    validateForm() {
        this.setState({formValid: this.state.userValid});
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
        const data ={
          key: "Users",
          value: this.state.user,
          projectName: this.props.projectName,
          type:'S'
        }
    
        axios({
          method:'post',
          url:'/update_user/',
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
                            text='Adding User...'
                            >
                    <ModalHeader>  Adding User for Project - {projectName}</ModalHeader>


                    <Form style ={{marginLeft: "20px", width: "624px"}}>
                    {isError==true?<Alert style={{width:"50%"}} color="warning" isOpen={isError} toggle={()=>{this.onDismiss(this)}}>
                          There was an Error in data
                        </Alert>:null}

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
