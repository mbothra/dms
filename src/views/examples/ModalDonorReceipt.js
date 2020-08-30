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
import Toggle from 'react-bootstrap-toggle';

import "react-datepicker/dist/react-datepicker.css";

const animatedComponents = makeAnimated();

export default class ModalAddDonorForm extends Component {
    constructor(props) {
        super(props)
      
        this.state = {
        }
    }
      onCloseClick=()=>{
        this.props.setModal()
      }
    render() {
        let {modalOpen,className,projectName, link} = this.props
        const {isActiveForm} = this.state
        return (
            <div>
                <Modal isOpen={modalOpen} toggle={this.props.setModal} className={className}>

                    <LoadingOverlay
                            active={isActiveForm}
                            spinner
                            text='Loading'
                            >
                    <ModalHeader>  Visit this link to download/edit the invoice before downloading </ModalHeader>
                    <a href={link} style={{width:'10px'}}>
                    <div style={{paddingLeft:'20px'}}>
                        {link}
                    </div>
                    </a>
                    <ModalFooter>
                    <Button color="secondary" onClick={()=>{this.onCloseClick()}}>Okay</Button>
                    </ModalFooter>
                    </LoadingOverlay>
                </Modal>
            </div>
        )
    }
}
