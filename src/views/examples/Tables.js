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
import axios from 'axios'
import LoadingOverlay from 'react-loading-overlay';
import ModalAddExpenseForm from './ModalAddExpenseForm'
import ModalUpdateBudgetForm from './ModalUpdateBudgetForm'
import ModalUpdateStatusForm from './ModalUpdateStatusForm'
import ModalAddUserForm from './ModalAddUserForm'
import ModalAddProjectForm from './ModalAddProjectForm'
import ModalUpdateCompletionForm from './ModalUpdateCompletionForm'
import makeAnimated from 'react-select/animated';
import Select from 'react-select'

// reactstrap components
import {
  Badge,
  Card,
  CardHeader,
  CardFooter,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
  Table,
  Container,
  Row,
  UncontrolledTooltip,
  Button,
  Col,
Alert} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
const animatedComponents = makeAnimated();

class Tables extends React.Component {
  constructor(props) {
    super(props)
  
    this.state = {
       projectCosts:'',
       projectList:'',
       projectName:'',
       isActiveList:false,
       isActiveProject:false,
       isError:false,
       projectNameForPass:'',
       totalSum:'',
       processedCosts:'',
       processedTotalSum:''
    }
    this.onDismiss=this.onDismiss.bind(this)
  }
  
  componentDidMount(){
    let me = this
    me.setState({
      isActiveList:true
    })
    axios({
      params: {
          name: "Summary"
        },
      method:'get',
      url:'/get_summary/'
    }).then(res => {
      me.setState({
          projectList:res.data,
          isActiveList:false
      })
    }).catch(error => {
      me.setState({
        isError:true
      })
      console.log(error.response)
  });
}

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
  
  result += (item[key].toString().replace(",",""));
  ctr++;
  });
  result += lineDelimiter;
  });
  
  return result;
  }

  downloadCSV = (data_to_csv, filename_csv) => {
    console.log(data_to_csv)
    var data, filename, link;
    var csv = this.convertArrayOfObjectsToCSV({
    data: data_to_csv
    });
    console.log(csv)
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


  loadProjectExpense(event,me, projectName){
    if(event != undefined){
      event.preventDefault()
    }
    me.setState({
      isActiveProject:true
    })
    axios({
      params: {
          name: projectName
        },
      method:'get',
      url:'/get_summary/'
    }).then(res => {
 
      let totalSum=0
      res.data.map((cost)=>{
        totalSum = totalSum + Number(cost.Total_cost.toString().replace(',',''))
      })
      me.setState({
        projectCosts:res.data,
        projectName:projectName,
        isActiveProject:false,
        totalSum:totalSum,
        processedCosts:res.data,
        processedTotalSum:totalSum
    })
    }).catch(error => {
      me.setState({
        isError:true
      })
      console.log(error.response)
  });
  }

  onDismiss(me){
    me.setState({
      isError:false,
      isActiveProject:false,
      isActiveList:false
    })
  }

  AddExpenseForm(event,me,projectName){
    event.preventDefault()
    me.setState({
      modal:true,
      projectNameForPass:projectName
    })
  }

  AddProject(event,me){
    event.preventDefault()
    me.setState({
      modalProject:true,
    })
  }

  onStartDateChange(event){
    this.setState({
      startDate:event
    },()=>{
    let ProcessedCostsData = []
    let projectCosts = this.state.projectCosts
    if(this.state.startDate && this.state.endDate){
      this.setState({
        isActiveList:true
      })
        for(let i=0;i<projectCosts.length;i++){
            let cost = projectCosts[i] 
            var dateString =  cost.Date // Oct 23

            var dateParts = dateString.split("/");

            // month is 0-based, that's why we need dataParts[1] - 1
            var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
            if(dateObject > this.state.startDate && dateObject<this.state.endDate){
              ProcessedCostsData.push(cost)
            }
        }
        let totalSum=0
        ProcessedCostsData.map((cost)=>{
          totalSum = totalSum + Number(cost.Total_cost.toString().replace(',',''))
        })
        this.setState({
          processedCosts :ProcessedCostsData,
          processedTotalSum:totalSum,
          isActiveList:false
        })       
    }
    else{
      this.setState({
        processedCosts:projectCosts,
      })
    }})
  }

  onEndDateChange(event){
    this.setState({
      endDate:event
    },()=>{
      let ProcessedCostsData = []
      let projectCosts = this.state.projectCosts
      if(this.state.startDate && this.state.endDate){
        this.setState({
          isActiveList:true
        })
          for(let i=0;i<projectCosts.length;i++){
              let cost = projectCosts[i] 
              var dateString =  cost.Date // Oct 23
  
              var dateParts = dateString.split("/");
  
              // month is 0-based, that's why we need dataParts[1] - 1
              var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
              if(dateObject > this.state.startDate && dateObject<this.state.endDate){
                ProcessedCostsData.push(cost)
              }
          }
          let totalSum=0
          ProcessedCostsData.map((cost)=>{
            totalSum = totalSum + Number(cost.Total_cost.toString().replace(',',''))
          })
          this.setState({
            processedCosts :ProcessedCostsData,
            processedTotalSum:totalSum,
            isActiveList:false
          })       
      }
      else{
        this.setState({
          processedCosts:projectCosts,
        })
      }})
  }

  reloadData(me){
    me.setState({
      isActiveList:true
    })
    axios({
      params: {
          name: "Summary"
        },
      method:'get',
      url:'/get_summary/'
    }).then(res => {
      me.setState({
          projectList:res.data,
          isActiveList:false
      })
    }).catch(error => {
      me.setState({
        isError:true
      })
      console.log(error.response)
  });
  }

  
  AddBudgetForm(event,me,projectName){
    event.preventDefault()
    me.setState({
      modalBudget:true,
      projectNameForPass:projectName
    })
  }

  AddProgressForm(event,me,projectName){
    event.preventDefault()
    me.setState({
      modalProgress:true,
      projectNameForPass:projectName
    })
  }

  AddStatusForm(event,me,projectName){
    event.preventDefault()
    me.setState({
      modalStatus:true,
      projectNameForPass:projectName
    })
  }

  AddUserForm(event,me,projectName){
    event.preventDefault()
    me.setState({
      modalUser:true,
      projectNameForPass:projectName
    })
  }

  setModal=()=>{
    this.setState({
        modal:false
    })
  }

  setModalBudget=()=>{
    this.setState({
        modalBudget:false
    })
  }

  setModalProgress=()=>{
    this.setState({
        modalProgress:false
    })
  }

  setModalStatus=()=>{
    this.setState({
        modalStatus:false
    })
  }

  setModalUser=()=>{
    this.setState({
        modalUser:false
    })
  }

  setModalProject=()=>{
    this.setState({
        modalProject:false
    })
  }
  onOptionsTableChange=(event)=>{
      this.setState({
          tableOptions:event
      }, console.log(event.value))
  }
  handleClickLineItem=(projectName)=>{
      let me =this
      let item = projectName +'_expanded'
      let isExpanded = item == this.state.expanded
      if(isExpanded){
        item = 0
      }
      me.setState({
        isActiveList:true
      })
      this.setState({
        expanded:item
      })
      axios({
        params: {
            name: projectName
          },
        method:'get',
        url:'/get_line_item/'
      }).then(res => {
        console.log(res)
        me.setState({
            projectLineItem:res.data,
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
    const tableOptions = [
      { value: 'Projects', label: 'Projects' },
      { value: 'Items', label: 'Items' },
    ]
    const {projectCosts,projectList,projectName, isActiveList, isActiveProject,isError,modal,projectNameForPass, totalSum, modalBudget, modalStatus,modalUser, modalProject, modalProgress, processedCosts, processedTotalSum, projectLineItem} = this.state
    return (
      <>
        <Header />
        {/* Page content */}
        <Container className="mt--7" fluid>
        {isError==true?<Alert color="warning" isOpen={isError} toggle={()=>{this.onDismiss(this)}}>
                          There was an Error. Please refresh the page
                        </Alert>:null}
          {/* Table */}
          <Row>
            <div className="col">
              <Card className="shadow">
              <LoadingOverlay
                  active={isActiveList}
                  spinner
                  text='Loading your content...'
                  >
                <CardHeader className="border-0">
                  <h3 className="mb-0" style={{float: 'left',width: '50%'}}>Project tables (Click on the project icon to view expenses below)</h3>
                  <Button style={{float:'right', marginBottom:'10px', marginTop:'-10px'}} onClick={(e) => this.AddProject(e, this)}>Add Project</Button>
                  <ModalAddProjectForm modalOpen={modalProject} onSuccess={(e)=>this.reloadData(this)} setModal={this.setModalProject} className="form"> </ModalAddProjectForm>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Project</th>
                      <th scope="col">Budget</th>
                      <th scope="col">Status</th>
                      <th scope="col">Users</th>
                      <th scope="col">Completion</th>
                      <th scope="col">Line Items</th>
                      <th scope="col" />
                    </tr>
                  </thead>
                  <tbody>
                  {projectList!=''?projectList.map((project,index)=>{
                    let path = "assets/img/theme/icon"+index+".png"
                    let users = project.Users.split(",")
                    let tooltip = "tooltip"+index
                    let item = project.Project_name + "_expanded"
                    let getItem = this.state.expanded
                      return( 
                        <React.Fragment>
                      <tr >
                        <th scope="row">
                          <Media className="align-items-center">
                            <a
                              className="avatar rounded-circle mr-3"
                              href="#pablo"
                              onClick={(e) => this.loadProjectExpense(e,this,project.Project_name)}
                            >
                              <img
                                alt="..."
                                src={require("assets/img/theme/icon"+(index+1)+".png")}
                              />
                            </a>
                            <Media>
                              <span className="mb-0 text-sm" onClick={() => this.loadProjectExpense(this)}>
                                {project.Project_name}                          
                              </span>
                            </Media>
                          </Media>
                        </th>
                        <td>
                        <span>{project.Budget} &#8377;</span>
                        </td>
                        <td>
                          <Badge color="" className="badge-dot mr-4">
                            <i className={project.Class_name}/>
                            {project.Status}
                          </Badge>
                        </td>

                        <td>
                            <div className="avatar-group">
                               {users.map((user,index2)=>{
                                 let tooltipNew = tooltip + index2
                                 return(
                                  <a      
                                    className="avatar avatar-sm"
                                    href="#pablo"
                                    id={tooltipNew}
                                    onClick={e => e.preventDefault()}
                                  >
                                    <img
                                      alt="..."
                                      className="rounded-circle"
                                      src={require("assets/img/theme/team-1-800x800.jpg")}
                                    />
                                  </a>
                                 )
                               })}
                               {users.map((user,index2)=>{
                                let tooltipNew = tooltip + index2
                                 return(
                                    <UncontrolledTooltip
                                    delay={0}
                                    target={tooltipNew}
                                  >
                                    {user}
                                  </UncontrolledTooltip>

                                 )
                               })} 
                             
                            </div>
                          </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="mr-2">{project.Progress} %</span>
                            <div>
                              <Progress
                                max="100"
                                value={project.Progress}
                                barClassName={project.Class_name}
                              />
                            </div>
                          </div>
                        </td>
                        <td classname='underline' onClick={()=>{this.handleClickLineItem(project.Project_name)}}>
                        <span style={{textDecoration:'underline', color:'cornflowerblue'}} role="button">Expand</span>
                        </td>
                        <td className="text-right">
                          <UncontrolledDropdown>
                            <DropdownToggle
                              className="btn-icon-only text-light"
                              href="#pablo"
                              role="button"
                              size="sm"
                              color=""
                              onClick={e => e.preventDefault()}
                            >
                              <i className="fas fa-ellipsis-v" />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                              <DropdownItem
                                href="#pablo"
                                onClick={(e) => {this.AddExpenseForm(e,this,project.Project_name)}}
                              >
                                Add Expense
                              </DropdownItem>
                              <ModalAddExpenseForm modalOpen={modal} onSuccess={(e)=>this.loadProjectExpense(e,this,projectNameForPass)}setModal={this.setModal} projectName={projectNameForPass} className="form"></ModalAddExpenseForm>
                              <DropdownItem
                                href="#pablo"
                                onClick={(e) => {this.AddBudgetForm(e,this,project.Project_name)}}
                              >
                                Update Budget
                              </DropdownItem>
                              <ModalUpdateBudgetForm modalOpen={modalBudget} onSuccess={()=>this.reloadData(this)} setModal={this.setModalBudget} projectName={projectNameForPass} className="form"></ModalUpdateBudgetForm>
                              <DropdownItem
                                href="#pablo"
                                onClick={(e) => {this.AddProgressForm(e,this,project.Project_name)}}
                              >
                                Update Progress
                              </DropdownItem>
                              <ModalUpdateCompletionForm modalOpen={modalProgress} onSuccess={()=>this.reloadData(this)} setModal={this.setModalProgress} projectName={projectNameForPass} className="form"></ModalUpdateCompletionForm>

                              <DropdownItem
                                href="#pablo"
                                onClick={(e) => {this.AddStatusForm(e,this,project.Project_name)}}
                              >
                                  Update Status
                              </DropdownItem>
                              <ModalUpdateStatusForm modalOpen={modalStatus} onSuccess={()=>this.reloadData(this)} setModal={this.setModalStatus} projectName={projectNameForPass} className="form"></ModalUpdateStatusForm>
                              <DropdownItem
                                href="#pablo"
                                onClick={(e) => {this.AddUserForm(e,this,project.Project_name)}}
                              >
                                  Add User
                              </DropdownItem>
                              <ModalAddUserForm modalOpen={modalUser} onSuccess={()=>this.reloadData(this)} setModal={this.setModalUser} projectName={projectNameForPass} className="form"></ModalAddUserForm>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                        </tr>
                        {this.state.expanded==item?
                        <tr className="table-striped">
                          <th  scope="colgroup" colspan="7">
                          <Table hover>
                              <thead className="thead-light">
                                <th scope="col"></th>
                                <th scope="col">Item</th>
                                <th scope="col">Budget</th>
                                <th scope="col">Total Costs</th>
                                <th scope="col">Utilization</th>
                              </thead>
                              <tbody>
                                {projectLineItem?projectLineItem.map((item)=>{
                                  console.log(item)
                                  let item_name = item["item_name"]
                                  let budget = item['budget']
                                  let total_cost = item['total_cost']
                                  return(
                                    <tr height="1px">
                                      <td >
                                        <i class={item['class_name']}></i>
                                      </td>
                                      <td>
                                        {item_name}
                                      </td>
                                      <td>{budget}</td>
                                      <td>{total_cost}</td>
                                      <td>{item['utilisation']} %</td>
                                    </tr>
                                  )
                                }):null
                                }
                              </tbody>
                           </Table>
                           </th>
                        </tr>:null}
                        </React.Fragment>
                        )}):null}

                  </tbody>
                </Table>
                <CardFooter className="py-4">
                  <nav aria-label="...">
                    <Pagination
                      className="pagination justify-content-end mb-0"
                      listClassName="justify-content-end mb-0"
                    >
                      <PaginationItem className="disabled">
                        <PaginationLink
                          href="#pablo"
                          onClick={e => e.preventDefault()}
                          tabIndex="-1"
                        >
                          <i className="fas fa-angle-left" />
                          <span className="sr-only">Previous</span>
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem className="active">
                        <PaginationLink
                          href="#pablo"
                          onClick={e => e.preventDefault()}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href="#pablo"
                          onClick={e => e.preventDefault()}
                        >
                          2 <span className="sr-only">(current)</span>
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href="#pablo"
                          onClick={e => e.preventDefault()}
                        >
                          3
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href="#pablo"
                          onClick={e => e.preventDefault()}
                        >
                          <i className="fas fa-angle-right" />
                          <span className="sr-only">Next</span>
                        </PaginationLink>
                      </PaginationItem>
                    </Pagination>
                  </nav>
                </CardFooter>
                </LoadingOverlay>
              </Card>
            </div>

          </Row>
          {/* Dark table */}
          <Row className="mt-5">
            <div className="col">
              <Card className="bg-default shadow">
              <LoadingOverlay
                  active={isActiveProject}
                  spinner
                  text='Loading your content...'
                  >
                <CardHeader className="bg-transparent border-0">
                <Row className="align-items-center">
                    <Col>
                              <h3 className="text-white mb-0">{projectName}</h3>
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
                        onClick={(e) => {this.downloadCSV(processedCosts,'export.csv')}}
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
                      <th scope="col">Item</th>
                      <th scope="col">Description</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Unit cost</th>
                      <th scope="col">Total Cost</th>
                      <th scope="col">Donors</th>
                      <th scope="col">Created By</th>
                    </tr>
                  </thead>
                  <tbody>

                  {processedCosts!=''?processedCosts.map((project)=>{
                          return( <tr>
                                <th scope="row">
                                <Media className="align-items-center">
                                    <Media>
                                    <span className="mb-0 text-sm">
                                        {project.Date}
                                    </span>
                                    </Media>
                                </Media>
                                </th>
                                <td>{project.Item}</td>
                                <td>{project.Description}</td>
                                <td>
                                <Badge color="" className="badge-dot mr-4">
                                    <i className="bg-warning" />
                                    {project.Quantity}
                                </Badge>
                                </td>
                                <td>{project.Unit_cost} &#8377;</td>
                                <td>
                                <div className="d-flex align-items-center">
                                    <span className="mr-2">{project.Total_cost} &#8377;</span>
                                </div>
                                </td>
                                <td>
                                    {project.Donors}
                                </td>
                                <td>
                                    {project.Created_by}
                                </td>
                            </tr>)
                    }):null}
                      {projectCosts!=''?<tr>
                          <th scope="row">
                          <Media className="align-items-center">
                              <Media>
                              <span className="mb-0 text-sm">
                              </span>
                              </Media>
                          </Media>
                          </th>
                          <td>Total Cost</td>
                          <td>
                          <Badge color="" className="badge-dot mr-4">
                              <i className="bg-warning" />
                          </Badge>
                          </td>
                          <td></td>
                          <td>
                          </td>
                          <td>
                          <div className="d-flex align-items-center">
                              <span className="mr-2">{processedTotalSum} &#8377;</span>
                          </div>
                          </td>

                          <td>
                              <span > </span>
                          </td>
                      </tr>:null}
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

export default Tables;
