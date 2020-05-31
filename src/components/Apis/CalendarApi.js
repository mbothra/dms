import React, {ReactNode, SyntheticEvent} from 'react';
import ApiCalendar from 'react-google-calendar-api';
import {Button} from 'reactstrap'

export default class CalendarApi extends React.Component {
    constructor(props) {
        super(props)
        this.handleItemClick = this.handleItemClick.bind(this);
        this.state = {
             events:''
        }
        this.checkSignIn = this.checkSignIn.bind(this);
        this.getEvents = this.getEvents.bind(this)
    }
    getEvents(){
        let me =this
        let calevent
        if(ApiCalendar.sign){
            return ApiCalendar
        }
        else{
            this.handleItemClick(null,"signin").then(()=>{
                ApiCalendar.listUpcomingEvents(10,'gbb1l215piese3vvh55kg9nhc0@group.calendar.google.com')
                .then((result) => {
                    calevent= result
                    me.setState({
                        events:result
                    })
                });
            }
            )
        }
        return ApiCalendar
    }
    addEvents(){
      var event = {
        summary: 'summary',
        description: 'description',
        start: {
            dateTime: new Date(),
        },
        end: {
            dateTime: new Date(new Date().getTime() + 1 * 60000),
        }
    };
      ApiCalendar.createEvent(event)
    }
    checkSignIn(){
      if(ApiCalendar.sign){
        return true
    }  else{
        return false
    }
    }
    handleItemClick(event, name) {
        let me=this
        if (name === 'sign-in') {
          ApiCalendar.handleAuthClick();
          
        } else if (name === 'sign-out') {
          ApiCalendar.handleSignoutClick();

        }
        setInterval(this.checkSignIn, 5000)
        ApiCalendar.listUpcomingEvents(10,'gbb1l215piese3vvh55kg9nhc0@group.calendar.google.com')
        .then((result) => {
            me.setState({
                events:result
            })
        });
      }

    render() {
            return (
                <div>
                  <Button
                      color="primary"
                      href="#pablo"
                      onClick={e => e.preventDefault()}
                      size="sm"
                      ref="signin" onClick={(e) => this.handleItemClick(e, 'sign-in')}
                      hidden={true}
                  >
                    sign-in
                  </Button>
                  <Button
                    hidden={true} ref="signout" onClick={(e) => this.handleItemClick(e, 'sign-out')}
                  >
                    sign-out
                  </Button>
                </div>
              );
    }
}
