import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import Select from 'react-select'
import {
    Col, Form,
    FormGroup, Label, Input,Alert
  } from 'reactstrap';
import makeAnimated from 'react-select/animated';
import axios from 'axios';
import LoadingOverlay from 'react-loading-overlay';
import DatePicker from "react-datepicker";

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
export default class ModalAddDonorForm extends Component {
    constructor(props) {
        super(props)
      
        this.state = {
           name:'',
           email:'',
           phone:'',
           amount:'',
           pan:'',
           category:'',
           address:'',
           emailValid: false,
           nameValid: false,
           phoneValid: false,
           formValid: false,
           addressValid: false,
           panValid: false,
           amountValid: false,
           categoryValid:false,
           projectsValid:false,
           paymentTypeValid:false,
           projectList:'',
           isError:false,
           isActiveForm:false,
           date:new Date(),
           dateValid:false,
           formErrors:{
            name:'',
            email:'',
            phone:'',
            amount:'',
            pan:'',
            category:'',
            address:'',
            date:'',
            paymentType:'',
           }
          }
        this.errorClass = this.errorClass.bind(this)
        this.onDismiss=this.onDismiss.bind(this)
    }
    
    onDismiss(me){
        me.setState({
          isError:false,
        })
      }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let emailValid= this.state.emailValid;
        let nameValid= this.state.nameValid;
        let phoneValid= this.state.phoneValid;
        let addressValid= this.state.addressValid;
        let panValid= this.state.panVal
        let amountValid= this.state.amountValid;
        let categoryValid=this.state.categoryValid;        
        let dateValid=this.state.dateValid;
        let paymentTypeValid=this.state.paymentTypeValid
        switch(fieldName) {
          case 'email':
            emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
            fieldValidationErrors.email = emailValid ? "" : 'Email is Invalid. Please Check';
            break;
          case 'pan':
            panValid = value.length == 10;
            fieldValidationErrors.pan = panValid ? '': 'Pan is Invalid. Please Check';
            break;
          case 'amount':
            amountValid = !(isNaN(value))
            fieldValidationErrors.amount = amountValid ? '': 'Amount is Invalid. Please Check'
            break;
          case 'name':
            nameValid = value.length > 0
            fieldValidationErrors.name = nameValid ? '':'Name is Invalid. Please Check'
            break;
          case 'address':
              addressValid = value.length > 0
              fieldValidationErrors.address = addressValid ? '':'Address is Invalid. Please Check'
              break;
          case 'category':
            categoryValid = value.length > 0
            fieldValidationErrors.category = categoryValid ? '':'Category is Invalid. Please Check'
            break;
          case 'paymentType':
            paymentTypeValid = value.length > 0
            fieldValidationErrors.category = paymentTypeValid ? '':'Payment Type is Invalid. Please Check'
            break;
          case 'phone':
            phoneValid = value.length == 10
            fieldValidationErrors.phone = phoneValid ? '':'Phone Number is Invalid. Please Check'
            break;
        case 'date':
            dateValid = value instanceof Date 
            fieldValidationErrors.date = dateValid?'':'Please Enter Date'
            break;
          default:
            break;
        }
        this.setState({formErrors: fieldValidationErrors,
                        emailValid: emailValid,
                        nameValid: nameValid,
                        phoneValid: phoneValid,
                        addressValid: addressValid,
                        panValid: panValid,
                        amountValid: amountValid,
                        categoryValid:categoryValid,
                        dateValid:dateValid,
                        paymentTypeValid: paymentTypeValid
                      }, this.validateForm);
    
    }

    validateForm() {
        this.setState({formValid: this.state.dateValid && this.state.emailValid && this.state.nameValid && 
            this.state.phoneValid && this.state.addressValid &&
            this.state.panValid && this.state.amountValid &&
          this.state.categoryValid && this.state.paymentTypeValid});
            }
    onSubmitClick(){
        let me = this
        me.setState({
            isActiveForm:true
        })
        let projects = this.state.projects
        let projectString= ''
        projects.map((project)=>{
            projectString =projectString + project.value
            projectString = projectString + ","
        })
        const donor ={
            Date: this.state.date.toLocaleDateString(),
            category: this.state.category.value,
            name: this.state.name,
            amount: Number(this.state.amount),
            pan: this.state.pan,
            email: this.state.email,
            phone: this.state.phone,
            address: this.state.address,
            projects:projectString.substring(0,projectString.length-1),
            payment_Mode:this.state.paymentType.value
        }
    
        axios({
            method:'post',
            url:'/add_donor/',
            data:JSON.stringify({donor}),
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
    
    onNameChange(event){
    
        this.setState({
            name:event.target.value
        },()=>{this.validateField('name', this.state.name)}
        )
    }
    onEmailChange(event){
        this.setState({
            email:event.target.value
        },
        ()=>{this.validateField('email', this.state.email)}
        )
    }
    onPhoneChange(event){
        this.setState({
            phone:event.target.value
        },
        ()=>{this.validateField('phone', this.state.phone)}    
        )
    }
    onAmountChange(event){
        this.setState({
            amount:event.target.value
        },
        ()=>{this.validateField('amount',this.state.amount)}
        )
    }
    onPanChange(event){
        this.setState({
            pan:event.target.value
        },
        ()=>{this.validateField('pan', this.state.pan)}
        )
    }
    onCategoryChange(event){
        this.setState({
            category:event
        },
        ()=>{this.validateField('category', this.state.category.value)}
        )
    }
    onPaymentTypeChange(event){
      this.setState({
          paymentType:event
      },
      ()=>{this.validateField('paymentType', this.state.paymentType.value)}
      )
    }
    onProjectsChange(event){
        this.setState({
            projects:event
        })
    }
    onAddressChange(event){
        this.setState({
            address:event.target.value
        },
        ()=>{this.validateField('address', this.state.address)}
        )
    }
    onDateChange(event){
        this.setState({
          date:event
        },()=>{this.validateField('date', this.state.date)}
        )
      }
    errorClass(error) {
        return(error.length === 0 ? '' : 'has-error');
    }
      onCloseClick=()=>{
        this.props.setModal()
      }
    componentDidMount(){
        let me = this
        axios({
            params: {
                name: "projects"
              },
            method:'get',
            url:'/get_donor_sheet/'
          }).then(res => {
            me.setState({
                projectList:res.data,
            })
          }).catch(error => {
            me.setState({
              isError:true
            })
            console.log(error.response)
        });
    }
    render() {
        let {modalOpen,className,projectName} = this.props
        const {isError,projectList,isActiveForm} = this.state
        const options = [
            { value: 'HNI', label: 'HNI / Foundation' },
            { value: 'CSR', label: 'CSR' },
            { value: 'Government', label: 'Government' },
            { value: 'Individuals', label: 'Individuals' },
            { value: 'Foundation', label: 'Foundation' },
            { value: 'Others', label: 'Others' }
          ]
          const options_project = []
        if(projectList!=''){
                projectList.map((project)=>{
                options_project.push({
                    value:project.project_name, label: project.project_name})
            })
        }
        options_project.push(
            { value: 'general', label: 'General' })
        const options_payment = [
          {value:'Cash', label: 'Cash'},
          {value:'Cheque', label: 'Cheque'},
          {value:'Others', label: 'Others'},
        ]
        return (
            <div>
                <Modal isOpen={modalOpen} toggle={this.props.setModal} className={className}>

                    <LoadingOverlay
                            active={isActiveForm}
                            spinner
                            text='Adding Donor...'
                            >
                    <ModalHeader>  Add expense for Project - {projectName}</ModalHeader>

                    <Form style ={{marginLeft: "20px", width: "624px"}}>
  
                    {isError==true?<Alert style={{width:"50%"}} color="warning" isOpen={isError} toggle={()=>{this.onDismiss(this)}}>
                          There was an Error in data
                        </Alert>:null}
                        <FormGroup row>
                        <Label sm={4}>Date of Expense</Label>
                        <Col style={{width:'50%'}}>
                        <DatePicker
                            className="w-20"
                            id="date"
                            placeholder="Select Date"
                            selected={this.state.date}
                            onChange={(event)=>{this.onDateChange(event)}}
                        />
                        </Col>
                        </FormGroup>
                        <FormGroup row>
                        <Label sm={4}>Category</Label>
                        <Col style={{width:'50%'}}>
                        <Select options={options}
                                components={animatedComponents}
                                closeMenuOnSelect={true}
                                value={this.state.category}
                                onChange={(event)=>{this.onCategoryChange(event)}}
                                className="w-50"
                        />
                        </Col>
                        </FormGroup>
                        <FormGroup row>
                        <Label sm={4}>Name</Label>
                        <Col>
                        <Input
                            className="w-50"
                            type="name"
                            name="name"
                            id="name"
                            placeholder="Doctor Strange"
                            value={this.state.name}
                            onChange={(event)=>{this.onNameChange(event)}}
                            className="w-50"

                            // style = {{width:"30%"}}
                        />
                        </Col>
                        </FormGroup>
                        <FormGroup row>
                        <Label sm={4}>Projects</Label>
                        <Col>
                        <Select options={options_project}
                                components={animatedComponents}
                                closeMenuOnSelect={true}
                                value={this.state.projects}
                                onChange={(event)=>{this.onProjectsChange(event)}}
                                className="w-50"
                                isMulti={true}
                        />
                        </Col>
                        </FormGroup>
                        <FormGroup row>
                        <Label sm={4}>Amount</Label>
                        <Col>
                        <Input
                            type="amount"
                            name="amount"
                            id="amount"
                            value={this.state.amount}
                            onChange={(event)=>{this.onAmountChange(event)}}
                            className="w-50"

                        />
                        </Col>
                        </FormGroup>

                        <FormGroup row>
                        <Label sm={4}>PAN</Label>
                        <Col>
                        <Input
                            type="pan"
                            name="pan"
                            id="pan"
                            value={this.state.pan}
                            onChange={(event)=>{this.onPanChange(event)}}
                            className="w-50"

                        />
                        </Col>
                        </FormGroup>

                        <FormGroup row>
                        <Label sm={4}>Address</Label>
                        <Col>
                        <Input
                            type="address"
                            name="address"
                            id="address"
                            value={this.state.address}
                            onChange={(event)=>{this.onAddressChange(event)}}
                            className="w-50"

                        />
                        </Col>
                        </FormGroup>

                        <FormGroup row>
                        <Label sm={4}>Phone</Label>
                        <Col>
                        <Input
                            type="phone"
                            name="phone"
                            id="phone"
                            value={this.state.phone}
                            onChange={(event)=>{this.onPhoneChange(event)}}
                            className="w-50"

                        />
                        </Col>
                        </FormGroup>

                        <FormGroup row>
                        <Label sm={4}>Email</Label>
                        <Col>
                        <Input
                            type="email"
                            name="email"
                            id="email"
                            value={this.state.email}
                            onChange={(event)=>{this.onEmailChange(event)}}
                            className="w-50"

                        />
                        </Col>
                        </FormGroup>
                        <FormGroup row>
                        <Label sm={4}>Payment Type</Label>
                        <Col>
                        <Select options={options_payment}
                                components={animatedComponents}
                                closeMenuOnSelect={true}
                                value={this.state.paymentType}
                                onChange={(event)=>{this.onPaymentTypeChange(event)}}
                                className="w-50"
                                isMulti={true}
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
