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
            date:new Date(),
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
            formErrors:{
                date:'',
                category:'',
                quantity:'',
                amount:'',
                creator:''
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
        let quantityValid= this.state.quantityValid;
        let dateValid= this.state.dateValid;
        let creatorValid= this.state.creatorValid;
        let amountValid= this.state.amountValid;
        let categoryValid=this.state.categoryValid;
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
        const expense ={
          Item: this.state.category.value,
          Date: this.state.date.toLocaleDateString(),
          Total_cost: Number(totalCost),
          Quantity: Number(quantity),
          Unit_cost: unitCost,
          Description: this.state.purpose,
          Created_by: this.state.creator,
          projectName: this.props.projectName
        }
    
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
        let {isError, isActiveForm} = this.state
        const options = [
            { value: 'food', label: 'Food' },
            { value: 'travel', label: 'Travel' },
            { value: 'hardware', label: 'Hardware/software' },
            { value: 'officesupplies', label: 'Office Supplies' },
            { value: 'teamouting', label: 'Team Outing' },
            { value: 'others', label: 'Others' }
          ]
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
