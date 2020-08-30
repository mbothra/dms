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
            date:null,
            dateValid:false,
            purpose:'',
            category:'',
            categoryValid:false,
            quantity:'',
            quantityValid:false,
            amount:'',
            amountValid:false,
            creator:'',
            creatorValid:false,
            isError:false,
            isActiveForm:false,
            donorList:'',
            optionsName:'',
            optionsNameValid:false,
            formErrors:{
                date:'',
                category:'',
                quantity:'',
                amount:'',
                creator:'',
                optionsName:''
            }
        }
        this.onDismiss=this.onDismiss.bind(this)
    }
    
    componentDidMount(){
      let me =this
      axios({
        params: {
            name: "donor_list"
          },
        method:'get',
        url:'/get_donor_sheet/'
      }).then(res => {
        console.log(res)
        me.setState({
            donorList:res.data,
        })
      }).catch(error => {
        me.setState({
          isError:true
        })
        console.log(error.response)
    });
    }

    onOptionsNameChange(event){
      let me =this
      if(event){
      this.setState({
          optionsName:event,
      },()=>{this.validateField('optionsName', this.state.optionsName[0].value.Name)})}
      else{
        this.setState({
          optionsName:event,
      },()=>{this.validateField('optionsName', '')})}
    }


    onDismiss(me){
        me.setState({
          isError:false,
        })
      }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let quantityValid= this.state.quantityValid;
        let dateValid= this.state.dateValid;
        let creatorValid= this.state.creatorValid;
        let amountValid= this.state.amountValid;
        let categoryValid=this.state.categoryValid;
        let optionsNameValid= this.state.optionsNameValid;
        switch(fieldName) {
          case 'amount':
            amountValid = !(isNaN(value))
            fieldValidationErrors.amount = amountValid ? '': 'Amount is Invalid. Please Check'
            break;
          case 'quantity':
            quantityValid = !(isNaN(value))
            fieldValidationErrors.quantity = quantityValid ? '': 'Amount is Invalid. Please Check'
            break;
          case 'creator':
              creatorValid = value.length > 0
              fieldValidationErrors.creator = creatorValid ? '':'Creator is Invalid. Please Check'
              break;
          case 'category':
            categoryValid = value.length > 0
            fieldValidationErrors.category = categoryValid ? '':'Category is Invalid. Please Check'
            break;
          case 'date':
            dateValid = value instanceof Date 
            fieldValidationErrors.date = dateValid?'':'Please Enter Date'
            break;
            case 'optionsName':
              console.log(value)
              optionsNameValid = value.length > 0
              fieldValidationErrors.optionsName = optionsNameValid ? '':'Name is Invalid. Please Check'
              break;
          default:
            break;
        }
        this.setState({formErrors: fieldValidationErrors,
            dateValid: dateValid,
            categoryValid: categoryValid,
            creatorValid: creatorValid,
            quantityValid: quantityValid,
            amountValid: amountValid,
          }, this.validateForm);
    }

    validateForm() {
        this.setState({formValid: this.state.dateValid && this.state.categoryValid && 
                                  this.state.creatorValid && this.state.quantityValid &&
                                  this.state.amountValid});
            }

    onDateChange(event){
        this.setState({
          date:event
        },()=>{this.validateField('date', this.state.date)}
        )
      }
    onCategoryChange(event){
        this.setState({
            category:event
        },
        ()=>{this.validateField('category', this.state.category.value)}
        )
    }
    onCreatorChange(event){
        this.setState({
            creator:event.target.value
        },
        ()=>{this.validateField('creator', this.state.creator)}
        )
    }
    onPurposeChange(event){
        this.setState({
          purpose:event.target.value
        })
    }
    onQuantityChange(event){
        this.setState({
            quantity:event.target.value
        },
        ()=>{this.validateField('quantity', this.state.quantity)}
        )
    }
    onAmountChange(event){
        this.setState({
            amount:event.target.value
        },
        ()=>{this.validateField('amount',this.state.amount)}
        )
    }
    onSubmitClick(){
        let me = this
        me.setState({
            isActiveForm:true
        })
        const totalCost= this.state.amount
        const quantity = this.state.quantity
        const unitCost = totalCost / quantity
        const donors = this.state.optionsName
        console.log(donors)
        let donorsString= ''
        donors.map((donor)=>{
          donorsString = donorsString + donor.label;
          donorsString = donorsString + ","
        })
        const expense ={
          Item: this.state.category.value,
          Date: this.state.date.toLocaleDateString(),
          Total_cost: Number(totalCost),
          Quantity: Number(quantity),
          Unit_cost: unitCost,
          Description: this.state.purpose,
          Created_by: this.state.creator,
          projectName: this.props.projectName,
          Donors:donorsString.substring(0,donorsString.length-1)
        }
        console.log(expense)
        axios({
          method:'post',
          url:'/add_expense/',
          data:JSON.stringify({expense}),
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
        let {isError, isActiveForm, donorList} = this.state
        const options = [
          { value: 'Food', label: 'Food' },
          { value: 'Travel', label: 'Travel' },
          { value: 'Hardware/software', label: 'Hardware/software' },
          { value: 'Office_Supplies', label: 'Office_Supplies' },
          { value: 'Team_Outing', label: 'Team_Outing' },
          { value: 'Others', label: 'Others' }
        ]
        const options_donor = []
        if(donorList!=''){
          donorList.map((donor)=>{
          options_donor.push({
              value:donor, label: donor.Name})
            })
        }
        return (
            <div>
                <Modal isOpen={modalOpen} toggle={this.props.setModal} className={className}>

                <LoadingOverlay
                            active={isActiveForm}
                            spinner
                            text='Adding Expense...'
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
                            dateFormat="dd/MM/yyyy h:mm aa"
                            showTimeSelect
                        />
                        </Col>
                        </FormGroup>
                        <FormGroup row>
                        <Label sm={4}>Expense Type</Label>
                        <Col>
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
                        <Label sm={4}>Purpose of Expense</Label>
                        <Col>
                        <Input
                            className="w-50"
                            type="purpose"
                            name="purpose"
                            id="purpose"
                            placeholder="----"
                            value={this.state.purpose}
                            onChange={(event)=>{this.onPurposeChange(event)}}
                            className="w-50"

                            // style = {{width:"30%"}}
                        />
                        </Col>
                        </FormGroup>
                        <FormGroup row>
                        <Label sm={4}>Quantity</Label>
                        <Col>
                        <Input
                            type="quantity"
                            name="quantity"
                            id="quantity"
                            value={this.state.quantity}
                            onChange={(event)=>{this.onQuantityChange(event)}}
                            className="w-50"

                        />
                        </Col>
                        </FormGroup>

                        <FormGroup row>
                        <Label sm={4}>Total Cost</Label>
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
                        <Label sm={4}>Donor</Label>
                        <Col>
                          <Select options={options_donor}
                                components={animatedComponents}
                                closeMenuOnSelect={true}
                                value={this.state.optionsName}
                                onChange={(event)=>{this.onOptionsNameChange(event)}}
                                className="w-50"
                                isMulti
                        />
                        </Col>
                        </FormGroup>
                        <FormGroup row>
                        <Label sm={4}>Created by</Label>
                        <Col>
                        <Input
                            type="creator"
                            name="creator"
                            id="creator"
                            value={this.state.creator}
                            onChange={(event)=>{this.onCreatorChange(event)}}
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
