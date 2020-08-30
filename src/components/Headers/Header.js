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

// reactstrap components
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";
import axios from 'axios';

class Header extends React.Component {
  constructor(props) {
    super(props)
  
    this.state = {
      projectNets:''
    }
  }
  
  componentDidMount(){
    let me = this
    axios({
      params: {
          name: "Nets"
        },
      method:'get',
      url:'/get_summary/'
    }).then(res => {
      me.setState({
          projectNets:res.data,
      })
    }).catch(error => {
      me.setState({
        isError:true
      })
  });
  }
  render() {
    const {projectNets} = this.state
    return (
      <>
        <div className="header pb-8 pt-5 pt-md-8" style={{background: "linear-gradient(#0a4366,#5e72e4)" }}>
          <Container fluid>
            <div className="header-body">
              {/* Card stats */}
              <Row>
                <Col lg="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            Total Donation
                          </CardTitle>
                          {projectNets!=''?
                              <span className="h2 font-weight-bold mb-0">
                                {projectNets.Total_donation} &#8377;
                              </span>
                              :
                              <span className="h2 font-weight-bold mb-0">
                                N/A
                            </span>}

                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                            <i className="fas fa-chart-bar" />
                          </div>
                        </Col>
                      </Row>
                      <p className="mt-3 mb-0 text-muted text-sm">
                        <span className="text-success mr-2">
                          <i className="fa fa-arrow-up" /> Overall
                        </span>{" "}
                        <span className="text-nowrap">No. of Donors - {projectNets.n_donors}</span>
                      </p>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            Total Expenses
                          </CardTitle>
                          {projectNets!=''?
                              <span className="h2 font-weight-bold mb-0">
                                {projectNets.Total_expenses} &#8377;
                              </span>
                              :
                              <span className="h2 font-weight-bold mb-0">
                                N/A
                            </span>}
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                            <i className="fas fa-chart-pie" />
                          </div>
                        </Col>
                      </Row>
                      <p className="mt-3 mb-0 text-muted text-sm">
                        <span className="text-success mr-2">
                          <i className="fas fa-arrow-up" /> Overall
                        </span>{" "}
                        <span className="text-nowrap">No. of Projects - {projectNets.n_projects}</span>
                      </p>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            Balance Amount
                          </CardTitle>
                          {projectNets!=''?
                              <span className="h2 font-weight-bold mb-0">
                                {projectNets.Balance_amount} &#8377;
                              </span>
                              :
                              <span className="h2 font-weight-bold mb-0">
                                N/A
                            </span>}                        
                            </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                            <i className="fas fa-users" />
                          </div>
                        </Col>
                      </Row>
                      <p className="mt-3 mb-0 text-muted text-sm">
                        <span className="text-warning mr-2">
                          <i className="fas fa-arrow-down" /> Remaining
                        </span>{" "}
                        <span className="text-nowrap">Budget - Expense</span>
                      </p>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            Budget Amount
                          </CardTitle>
                          {projectNets!=''?
                              <span className="h2 font-weight-bold mb-0">
                                {projectNets.Total_budget} &#8377;
                              </span>
                              :
                              <span className="h2 font-weight-bold mb-0">
                                N/A
                            </span>}
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                            <i className="fas fa-percent" />
                          </div>
                        </Col>
                      </Row>
                      <p className="mt-3 mb-0 text-muted text-sm">
                        <span className="text-success mr-2">
                          <i className="fas fa-arrow-up" /> Total Budget
                        </span>{" "}
                        <span className="text-nowrap">All Projects</span>
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          </Container>
        </div>
      </>
    );
  }
}

export default Header;
