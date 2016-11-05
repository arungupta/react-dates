import React from 'react';
import moment from "moment";
import DateRangePicker from '../src/components/DateRangePicker';

class DateRangePickerWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedInput: "",
      startDate: null,
      endDate: null,
      visible: true,
      error: {
        start: false,
        end: false,
      }
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onDatesChange({ startDate, endDate, startDateValid, endDateValid }) {
    // console.log("change", startDate, endDate)
    this.setState({ startDate, endDate, error: {start: startDateValid, end: endDateValid} });
  }

  onFocusChange(focusedInput) {
    if (focusedInput) {
      this.setState({ focusedInput });
    }
  }

  onSubmit(input) {
    const {startDate, endDate} = this.state
  }

  componentDidMount() {
    setTimeout(() =>  this.setState({initM: moment().add(1, "month").subtract(4, "years"), focusedInput: "startDate"}), 300);
  }

  render() {
    const { focusedInput, startDate, endDate, visible, error } = this.state;
    const initM = () => this.state.initM ? this.state.initM : moment()
    return (
      <div>
        <DateRangePicker
          {...this.props}
          onSubmit={this.onSubmit}
          error={error}
          datepickerVisible={visible}
          onDatesChange={this.onDatesChange}
          onFocusChange={this.onFocusChange}
          focusedInput={focusedInput}
          startDate={startDate}
          endDate={endDate}
          initialVisibleMonth={initM}
          startDatePlaceholder={moment().startOf("day").format("MM/DD/YYYY HH:mm:ss")}
          endDatePlaceholder={moment("235959", "hmmss").format("MM/DD/YYYY HH:mm:ss")}
          onDateRangeClickEnd={(d) => console.log(d)}
        />
      </div>
    );
  }
}

export default DateRangePickerWrapper;
