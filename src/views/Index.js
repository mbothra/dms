/*!

=========================================================
* Argon Dashboard React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
// node.js library that concatenates classes (strings)
import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
import ModalAddDonorForm from './examples/ModalAddDonorForm'
import ModalAddCalEventForm from './examples/ModalAddCalEventForm'
import ModalDonorReceipt from './examples/ModalDonorReceipt'

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
  Media,
  Badge,
Alert} from "reactstrap";
import axios from 'axios';
import LoadingOverlay from 'react-loading-overlay';

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2
} from "variables/charts.js";

import CalendarApi from 'components/Apis/CalendarApi'

import Header from "components/Headers/Header.js";

class Index extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      activeNav: 1,
      chartExample1Data: "data1",
      calendarSignCheck:"sign in",
      isError:false,
      projectNets:'',
      donors:'',
      processedDonor:'',
      isActiveList:false,
      chartData:'',
      expensesData:'',
      hniAmount:0,
      individualAmount:0,
      csrAmount:0,
      govAmount:0,
      foundationAmount:0,
      othersAmount:0,
      eventShow:false
    };
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }
    this.loadEvents = this.loadEvents.bind(this)
  }
  toggleNavs = (e, index) => {
    e.preventDefault();
    this.setState({
      activeNav: index,
      chartExample1Data:
        this.state.chartExample1Data === "data1" ? "data2" : "data1"
    });
  };

   convertArrayOfObjectsToCSV = (args) => {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;
    
    data = args.data || null;
    if (data == null || !data.length) {
    return null;
    }
    
    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';
    
    keys = Object.keys(data[0]);
    
    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;
    
    data.forEach(function(item) {
    ctr = 0;
    keys.forEach(function(key) {
    if (ctr > 0) result += columnDelimiter;
    
    result += item[key];
    ctr++;
    });
    result += lineDelimiter;
    });
    
    return result;
    }

    downloadCSV = (data_to_csv, filename_csv) => {
      var data, filename, link;
      var csv = this.convertArrayOfObjectsToCSV({
      data: data_to_csv
      });
      if (csv == null) return;
      
      filename = filename_csv || 'export.csv';
      
      if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
      }
      data = encodeURI(csv);
      
      link = document.createElement('a');
      link.setAttribute('href', data);
      link.setAttribute('download', filename);
      link.click();
      }

  loadEvents = (event,me)=>{
    event.preventDefault()
    let ApiCalendar
    if (me.state.calendarSignCheck == "sign out"){
      me.setState({
        calendarSignCheck:"sign in",
        events:null
      })
      return
    }

    axios({
      method:'get',
      url:'/get_calendar_events/'
    }).then(res => {
  
      me.setState({
        events:res.data,
        calendarSignCheck:"sign out",
        eventShow:true
    })
    }).catch(error => {
      me.setState({
        isError:true
      })
      console.log(error.response)
  });

  }
  AddEvents(e, me){
    e.preventDefault()

  }

  componentDidMount(){
    let me =this
    me.setState({
      isActiveList:true
    })
      axios({
        method:'get',
        url:'/get_donor/'
      }).then(res => {
        me.setState({
            donors:res.data,
            isActiveList:false,
            processedDonor:res.data

        })
        me.setChartData(res.data,me)
      }).catch(error => {
        me.setState({
          isError:true
        })
        console.log(error.response)
    });

    axios({
      params: {
          name: "Report"
        },
      method:'get',
      url:'/get_summary/'
    }).then(res => {
      console.log(res)
      me.setState({
        expensesData : res.data
      })
    }).catch(error => {
      console.log(error)
      me.setState({
        isError:true
      })
      console.log(error.response)
  });
  }
  setChartData(donors,me){
    let arr = []
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    let chartMap = new Map();
    let hniAmount =0, govAmount=0,csrAmount=0,foundationAmount=0,othersAmount=0,individualAmount=0
    donors.map((donor)=>{
      let year = donor.Date.substring(8,10)
      let month = Number(donor.Date.substring(3,5))-1
      let amount = Number(donor.Amount.toString().replace(",",""))
      let label = monthNames[month] +"-"+year
      if(chartMap.has(label)){
        chartMap.set(label,chartMap.get(label)+amount)
      }
      else{
        chartMap.set(label,amount)
      }
      switch( donor.Category){
        case 'HNI': 
          hniAmount = hniAmount + amount
          break 
        case 'CSR': 
          csrAmount = csrAmount + amount
          break         
        case 'Government': 
          govAmount = govAmount + amount
          break         
        case 'Individuals': 
          individualAmount = individualAmount + amount
          break         
        case 'Foundation': 
          foundationAmount = foundationAmount + amount
          break         
        case 'Others': 
          othersAmount = othersAmount + amount
          break 
        default:
          othersAmount = othersAmount + amount
          break
      }

    })
    let chartData = Object.fromEntries(chartMap);
    me.setState({
      chartData:chartData,
      hniAmount:hniAmount,
      govAmount:govAmount,
      csrAmount:csrAmount,
      individualAmount:individualAmount,
      foundationAmount:foundationAmount,
      othersAmount:othersAmount
    })
  }
  shouldComponentUpdate(){
    return true
  }

  onStartDateChange(event){
    this.setState({
      startDate:event
    },()=>{
    let ProcessedDonorData = []
    let donors = this.state.donors
    if(this.state.startDate && this.state.endDate){
      this.setState({
        isActiveList:true
      })
        for(let i=0;i<donors.length;i++){
            let donor = donors[i] 
            var dateString =  donor.Date // Oct 23

            var dateParts = dateString.split("/");

            // month is 0-based, that's why we need dataParts[1] - 1
            var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
            if(dateObject > this.state.startDate && dateObject<this.state.endDate){
              ProcessedDonorData.push(donor)
            }
        }
        this.setState({
          processedDonor :ProcessedDonorData,
          isActiveList:false
        })       
    }
    else{
      this.setState({
        processedDonor:donors,
      })
    }})
  }

  onEndDateChange(event){
    this.setState({
      endDate:event
    },()=>{
    let ProcessedDonorData = []
    let donors = this.state.donors
    if(this.state.startDate && this.state.endDate){
        let donors = this.state.donors
        for(let i=0;i<donors.length;i++){
              let donor = donors[i] 

            var dateString =  donor.Date // Oct 23

            var dateParts = dateString.split("/");

            // month is 0-based, that's why we need dataParts[1] - 1
            var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
            if(dateObject > this.state.startDate && dateObject<this.state.endDate){
              ProcessedDonorData.push(donor)
            }
        }
        this.setState({
          processedDonor :ProcessedDonorData,
        })       
    }
    else{
      this.setState({
        processedDonor :donors,
      })
    }})
  }

  AddDonorForm(event,me){
    event.preventDefault()
    me.setState({
      modal:true,
    })
  }
  setModal=()=>{
    this.setState({
        modal:false
    })
  }
  setModalDonorReceipt=()=>{
    this.setState({
        modalDonorReceipt:false
    })
  }
  AddEventForm(event,me){
    event.preventDefault()
    me.setState({
      modalEvent:true,
    })
  }
  setModalEvent=()=>{
    this.setState({
        modalEvent:false
    })
  }
  onDismiss(me){
    me.setState({
      isError:false,
    })
  }
  downloadReceipt(donor,me){
    me.setState({
      isActiveList:true
    })
      axios({
        method:'post',
        url:'/download_donor_receipt/',
        data:JSON.stringify({donor}),
        headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        },
    }).then(res => {
      me.setState({
        receiptsLink:res.data,
        isActiveList:false,
        modalDonorReceipt:true
      })
    }).catch(error => {
        console.log(error.response)
    });
  }
  reloadData(me){
    me.setState({
      isActiveList:true
    })
      axios({
        method:'get',
        url:'/get_donor/'
      }).then(res => {
        me.setState({
            donors:res.data,
            isActiveList:false

        })
      }).catch(error => {
        me.setState({
          isError:true
        })
        console.log(error.response)
    });
  }
  render() {
    const {events,isError,donors,isActiveList,modal,chartData,expensesData,hniAmount,csrAmount,govAmount,individualAmount,foundationAmount,othersAmount, modalEvent, processedDonor, receiptsLink, modalDonorReceipt} = this.state
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    let sortedKeys = Object.keys(chartData).sort((a,b)=>{return monthNames.indexOf(a.substring(0,3)) - monthNames.indexOf(b.substring(0,3))})
    let totalDonations =0
    let data = sortedKeys.map((key)=>{
      totalDonations = totalDonations + Number(chartData[key].toString().replace(",",""))
      return chartData[key]})
    let dataNew = ''
    if (expensesData !=''){
      let filteredData = expensesData.filter((expense)=>expense.Expense>0)
      let labels = []
      var dataExpense = []
      for(let i=0; i<expensesData.length; i++){
        var keys = Object.keys(expensesData[i])
        labels.push(keys[0])
        dataExpense.push(expensesData[i][keys[0]])
      }
    dataNew =  canvas => {
        return {
          labels: labels,
          datasets: [
            {
              label: "Performance",
              data: dataExpense
            }
          ]
        };
      }
    }

    let dataDonor = {
      labels: sortedKeys,
      datasets: [
        {
          label: "Sales",
          data: data,
          maxBarThickness: 10
        }
      ]
    }
    return (
      <>
        <Header />
        {/* Page content */}
        <Container className="mt--7" fluid>
        {isError==true?<Alert color="warning" isOpen={isError} toggle={()=>{this.onDismiss(this)}}>
                          There was an Error. Please refresh the page
                        </Alert>:null}
          <Row>
            <Col className="mb-5 mb-xl-0" xl="8">
              <Card className="bg-gradient-default shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <div className="col">
                      <h6 className="text-uppercase text-light ls-1 mb-1">
                        Overview
                      </h6>
                      <h2 className="text-white mb-0">Total Expense</h2>
                    </div>
                    <div className="col">
                      <Nav className="justify-content-end" pills>
                        <NavItem>
                          <NavLink
                            className={classnames("py-2 px-3", {
                              active: this.state.activeNav === 1
                            })}
                            href="#pablo"
                            onClick={e => this.toggleNavs(e, 1)}
                          >
                            <span className="d-none d-md-block">Month</span>
                            <span className="d-md-none">M</span>
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={classnames("py-2 px-3", {
                              active: this.state.activeNav === 2
                            })}
                            data-toggle="tab"
                            href="#pablo"
                            onClick={e => this.toggleNavs(e, 2)}
                          >
                            <span className="d-none d-md-block">Week</span>
                            <span className="d-md-none">W</span>
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody>
                  {/* Chart */}
                  <div className="chart">

                    {dataNew!=''?
                      <Line
                        data={dataNew}
                        options={chartExample1.options}
                        getDatasetAtEvent={e => console.log(e)}
                      />
                    :null}
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl="4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <div className="col">
                      <h6 className="text-uppercase text-muted ls-1 mb-1">
                        Performance
                      </h6>
                      <h2 className="mb-0">Total Donations</h2>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody>
                  {/* Chart */}
                  <div className="chart">
                    <Bar
                      data={dataDonor}
                      options={chartExample2.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row className="mt-5">
            <Col className="mb-5 mb-xl-0" xl="8">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <Row className="align-items-center">
                    <div className="col">
                      <h3 className="mb-0">Calendar Events</h3>
                    </div>
                    <div className="col text-right">
                      <Button
                        color="primary"
                        href="#pablo"
                        onClick={(event)=>{
                          this.loadEvents(event,this)
                        }}
                        size="sm"
                      >
                        {this.state.calendarSignCheck}
                      </Button>
                      <Button
                        color="primary"
                        href="#pablo"
                        onClick={(event)=>{
                          this.AddEventForm(event,this)
                        }}
                        size="sm"
                        style={{hidden:this.state.eventShow}}
                      >
                        Add Events
                      </Button>
                      <ModalAddCalEventForm modalOpen={modalEvent} onSuccess={()=>{}} setModal={this.setModalEvent} className="form"></ModalAddCalEventForm>

                      <CalendarApi ref="calendar"/>
                    </div>
                  </Row>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Event name</th>
                      <th scope="col">Date</th>
                      <th scope="col">user</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events!=null?events.map((event) => {
                    return (
                              <tr>
                                <th scope="row">{event.summary}</th>
                                <td>{event.created}</td>
                                <td>{event.creator.email}</td>
                              </tr>)
                  }
                  ):null}
                  </tbody>
                </Table>
              </Card>
            </Col>
            <Col xl="4">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <Row className="align-items-center">
                    <div className="col">
                      <h3 className="mb-0">Donor List</h3>
                    </div>
                    <div className="col text-right">
                      <Button
                        color="primary"
                        href="#pablo"
                        onClick={(e) => {this.AddDonorForm(e,this)}}
                        size="sm"
                      >
                        Add Donor
                      </Button>
                    </div>
                    <ModalAddDonorForm modalOpen={modal} onSuccess={()=>this.reloadData(this)} setModal={this.setModal} className="form"></ModalAddDonorForm>
                    <ModalDonorReceipt modalOpen={modalDonorReceipt} setModal={this.setModalDonorReceipt} className="form" link={receiptsLink}></ModalDonorReceipt>

                  </Row>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Donor Type</th>
                      <th scope="col">Amount</th>
                      <th scope="col" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">HNI</th>
                      <td>{hniAmount}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="mr-2">{(hniAmount*100/totalDonations).toString().substring(0,3)}%</span>
                          <div>
                            <Progress
                              max="100"
                              value={(hniAmount*100/totalDonations).toString().substring(0,3)}
                              barClassName="bg-gradient-danger"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Government</th>
                      <td>{govAmount}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="mr-2">{(govAmount*100/totalDonations).toString().substring(0,3)}%</span>
                          <div>
                            <Progress
                              max="100"
                              value={(govAmount*100/totalDonations).toString().substring(0,3)}
                              barClassName="bg-gradient-success"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Foundation</th>
                      <td>{foundationAmount}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="mr-2">{(foundationAmount*100/totalDonations).toString().substring(0,3)}%</span>
                          <div>
                            <Progress max="100" value={(foundationAmount*100/totalDonations).toString().substring(0,3)} />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Online/Individuals</th>
                      <td>{individualAmount}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="mr-2">{(individualAmount*100/totalDonations).toString().substring(0,3)}%</span>
                          <div>
                            <Progress
                              max="100"
                              value={(individualAmount*100/totalDonations).toString().substring(0,3)}
                              barClassName="bg-gradient-info"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">CSR</th>
                      <td>{csrAmount}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="mr-2">{(csrAmount*100/totalDonations).toString().substring(0,3)}%</span>
                          <div>
                            <Progress
                              max="100"
                              value={(csrAmount*100/totalDonations).toString().substring(0,3)}
                              barClassName="bg-gradient-warning"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Others</th>
                      <td>{othersAmount}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="mr-2">{(othersAmount*100/totalDonations).toString().substring(0,3)}%</span>
                          <div>
                            <Progress
                              max="100"
                              value={(othersAmount*100/totalDonations).toString().substring(0,3)}
                              barClassName="bg-gradient-warning"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
          <Row className="mt-5">
            <div className="col">
              <Card className="bg-default shadow">
              <LoadingOverlay
                  active={isActiveList}
                  spinner
                  text='Completing Action...'
                  >
                <CardHeader className="bg-transparent border-0">
                <Row className="align-items-center">
                    <Col>
                    <h3 className="text-white mb-0">Donors List</h3>
                    </Col>

                    <Col>
                    </Col>
                    <Col>
                    </Col>

                    <h5 className="text-white mb-0">Start Date</h5>
                    <Col>
                    <DatePicker
                            className="w-5"
                            id="date"
                            placeholder="Select Date"
                            selected={this.state.startDate}
                            onChange={(event)=>{this.onStartDateChange(event)}}
                        />
                      </Col>
                      <h5 className="text-white mb-0">End Date</h5>

                      <Col>
                      <DatePicker
                            className="w-5"
                            id="date"
                            placeholder="Select Date"
                            selected={this.state.endDate}
                            onChange={(event)=>{this.onEndDateChange(event)}}
                        />
                      </Col>
                      <Col>
                    <Button
                        color="primary"
                        href="#pablo"
                        onClick={(e) => {this.downloadCSV(processedDonor,'export.csv')}}
                        size="sm"
                      >
                        Export CSV
                      </Button>
                    </Col>
                  </Row>
                </CardHeader>
  
                <Table
                  className="align-items-center table-dark table-flush"
                  responsive
                >
                  <thead className="thead-dark">
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Category</th>
                      <th scope="col">Name</th>
                      <th scope="col">Projects</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Pan</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Address</th>
                      <th scope="col">Payment Mode</th>
                      <th scope="col">Download Receipt</th>
                    </tr>
                  </thead>
                  <tbody>

                  {processedDonor!=''?
                      processedDonor.map((donor)=>{
                          return( <tr>
                                <th scope="row">
                                <Media className="align-items-center">
                                    <Media>
                                    <span className="mb-0 text-sm">
                                        {donor.Date}
                                    </span>
                                    </Media>
                                </Media>
                                </th>
                                <th scope="row">
                                <Media className="align-items-center">
                                    <Media>
                                    <span className="mb-0 text-sm">
                                        {donor.Category}
                                    </span>
                                    </Media>
                                </Media>
                                </th>
                                <td>{donor.Name}</td>
                                <td>{donor.Projects}</td>
                                <td>
                                <Badge color="" className="badge-dot mr-4">
                                    <i className="bg-warning" />
                                    {donor.Amount} &#8377;
                                </Badge>
                                </td>
                                <td>{donor.Pan}</td>
                                <td>
                                <div className="d-flex align-items-center">
                                    <span className="mr-2">{donor.Email}</span>
                                </div>
                                </td>
                                <td>
                                    {donor.Phone}
                                </td>
                                <td>
                                    {donor.Address}
                                </td>
                                <td>
                                    {donor.Payment_mode}
                                </td>
                                <td>
                                    <span className="fa fa-file" onClick={()=>{this.downloadReceipt(donor,this)}}> Download</span>
                                </td>
                            </tr>)
                    }):null}
                  </tbody>
                </Table>
                </LoadingOverlay>
              </Card>
            </div>
          </Row>
        </Container>
      </>
    );
  }
}

export default Index;
