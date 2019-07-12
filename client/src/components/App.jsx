import React from 'react';
import Dates from './Dates.jsx';
import Guests from './Guests.jsx';
import axios from 'axios';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listing: {},
      guestTotal: 1,
      guestAdults: 1,
      guestChildren: 0,
      guestInfants: 0,
      currentCalendar: [],
      currentMonth: 'July',
      checkInDate: 'Check-in',
      checkOutDate: 'Checkout'
    }

    this.fetchCalendarData = this.fetchCalendarData.bind(this);
    this.updateGuestTotal = this.updateGuestTotal.bind(this);
    this.updateCheckInDate = this.updateCheckInDate.bind(this);
    this.updateCheckOutDate = this.updateCheckOutDate.bind(this);
  }

  componentDidMount() {
    fetch('/rooms/bookings/listings')
    .then(res => res.json())
    .then((result) => {
      console.log(result[1]);
      this.setState({
        listing: result[1]
      })
    },
    (err) => {
      console.log('ERROR ON MOUNT: ' + err);
    })
  }

  fetchCalendarData(month) {
    let monthParam = month.length === 0 ? 'July' : month;
    let url = `/rooms/bookings/dates/${monthParam}`;
    axios.get(url)
    .then((results) => {
      // console.log('FETCH CALENDAR DATA RESULTS:')
      // console.log(results.data);

      let month = [];
      let week = [];
      let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let emptyBox = {
        type: 'emptyDay'
      };

      for (var i = 0; i < results.data.length; i++) {
        let currentDay = results.data[i];
        currentDay['type'] = 'day';
        if (i === 1 && currentDay.weekday !== 'Sunday') {
          let firstIndex = weekdays.indexOf(currentDay.weekday);
          for (var j = 1; j < firstIndex; j++) {
            week.unshift(emptyBox);
          }
          week.push(currentDay); 
        } else if (currentDay.weekday === 'Saturday' && i !== results.data.length-1) {
          week.push(currentDay);
          month.push(week);
          week = [];
        } else if (i === results.data.length-1) {
          week.push(currentDay);
          if (currentDay.weekday !== 'Saturday') {
            let lastIndex = weekdays.indexOf(currentDay.weekday);
            let lastEmptyBoxCount = weekdays.length - (lastIndex+1);
            for (var k = 0; k < lastEmptyBoxCount; k++) {
              week.push(emptyBox);
            }
          }
          month.push(week);
        } else {
          week.push(currentDay);
        }
      }

      console.log(month);

      this.setState({
        currentCalendar: month,
        currentMonth: monthParam
      })
    })
    .catch((err) => {
      console.log('ERROR ON FETCH CAL DATA:');
      console.log(err);
    })
  }

  // fetchAvailableDates() {

  // }

  updateGuestTotal(type, guest) {
    if (type === 'add') {
      if (guest === 'infants') {
        if (!this.state.listing.infant_guest_eligible && this.state.guestInfants !== 5) {
          this.setState({
            guestInfants: this.state.guestInfants+1
          })
        } else if (this.state.listing.infant_guest_eligible) {
          if (this.state.guestTotal !== this.state.listing.max_no_guests) {
            this.setState({
              guestInfants: this.state.guestInfants+1,
              guestTotal: this.state.guestTotal+1
            })
          }
        }
      }

      if (this.state.guestTotal !== this.state.listing.max_no_guests) {
        if (guest === 'adults') {
          this.setState({
            guestAdults: this.state.guestAdults+1,
            guestTotal: this.state.guestTotal+1
          })
        } else if (guest === 'children') {
          this.setState({
            guestChildren: this.state.guestChildren+1,
            guestTotal: this.state.guestTotal+1
          })
        }
      }
    } else {
      if (guest === 'adults') {
        if (this.state.guestAdults !== 1) {
          this.setState({
            guestAdults: this.state.guestAdults-1,
            guestTotal: this.state.guestTotal-1
          })
        }
      } else if (guest === 'children') {
        if (this.state.guestChildren !== 0) {
          this.setState({
            guestChildren: this.state.guestChildren-1,
            guestTotal: this.state.guestTotal-1
          })
        }
      } else if (guest === 'infants') {
        if (this.state.guestInfants !== 0) {
          this.setState({
            guestInfants: this.state.guestInfants-1
          })

          if (this.state.listing.infant_guest_eligible) {
            this.setState({
              guestTotal: this.state.guestTotal-1
            })
          }
        }
      }
    }
  }

  updateCheckInDate(date) {
    this.setState({
      checkInDate: date
    })
  }

  updateCheckOutDate(date) {
    this.setState({
      checkOutDate: date
    })
  }

  render() {
    let price = (Number(this.state.listing.price_per_night)).toString();

    return (
      <div className='bookings'>
        <h1 className='dollarSign'>$</h1>
        <h1 className='price'>{price}</h1>
        <p className='perNight'>per night</p>

        <div className='starContainer'>
          <img src='https://i.ibb.co/NWJ1j37/new-Teal-Star.png' className='stars'/>
          <img src='https://i.ibb.co/NWJ1j37/new-Teal-Star.png' className='stars'/>
          <img src='https://i.ibb.co/NWJ1j37/new-Teal-Star.png' className='stars'/>
          <img src='https://i.ibb.co/NWJ1j37/new-Teal-Star.png' className='stars'/>
          <img src='https://i.ibb.co/NWJ1j37/new-Teal-Star.png' className='stars'/>
          <p className='reviewCount'>214</p>
        </div>

        <div className='bookingFields'>
          <Dates 
           fetchDates={this.fetchCalendarData}
           calendar={this.state.currentCalendar}
           month={this.state.currentMonth}
           selectCheckIn={this.updateCheckInDate}
           selectCheckOut={this.updateCheckOutDate}
           checkIn={this.state.checkInDate}
           checkOut={this.state.checkOutDate}/>

          <Guests 
           house={this.state.listing}
           infantEligiblity={this.state.listing.infant_guest_eligible}
           maxGuestCount={this.state.listing.max_no_guests}
           total={this.state.guestTotal}
           adults={this.state.guestAdults}
           children={this.state.guestChildren}
           infants={this.state.guestInfants}
           updateGuest={this.updateGuestTotal}
          />

          {/* <Quote /> */}
          
          <button className='bookBtn'>Book</button>
          <p className='noCharge'>You won't be charged yet</p>
        </div>

        <p className='highlight'>
          This place is getting a lot of attention.
          <img src='https://a0.muscache.com/airbnb/static/packages/icon-uc-light-bulb.1ffc0407.gif' className='lightBulb'/>
        </p>
        <p className='successMetric'>It’s been viewed 500+ times in the past week.</p>
      </div>
    )
  }
}

export default App;