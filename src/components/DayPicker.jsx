import React, { PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import ReactDOM from 'react-dom';
import moment from 'moment';
import cx from 'classnames';

import OutsideClickHandler from './OutsideClickHandler';
import CalendarMonthGrid from './CalendarMonthGrid';

import LeftArrow from '../svg/arrow-left.svg';
import RightArrow from '../svg/arrow-right.svg';
import ChevronUp from '../svg/chevron-up.svg';
import ChevronDown from '../svg/chevron-down.svg';

import getTransformStyles from '../utils/getTransformStyles';

import OrientationShape from '../shapes/OrientationShape';

import { HORIZONTAL_ORIENTATION, VERTICAL_ORIENTATION } from '../../constants';

const CALENDAR_MONTH_WIDTH = 300;
const DAY_PICKER_PADDING = 9;
const MONTH_PADDING = 23;
const PREV_TRANSITION = 'prev';
const NEXT_TRANSITION = 'next';

const propTypes = {
  enableOutsideDays: PropTypes.bool,
  numberOfMonths: PropTypes.number,
  modifiers: PropTypes.object,
  orientation: OrientationShape,
  withPortal: PropTypes.bool,
  hidden: PropTypes.bool,
  initialVisibleMonth: PropTypes.func,
  onDayClick: PropTypes.func,
  onDayMouseDown: PropTypes.func,
  onDayMouseUp: PropTypes.func,
  onDayMouseEnter: PropTypes.func,
  onDayMouseLeave: PropTypes.func,
  onDayTouchStart: PropTypes.func,
  onDayTouchEnd: PropTypes.func,
  onDayTouchTap: PropTypes.func,
  onPrevMonthClick: PropTypes.func,
  onNextMonthClick: PropTypes.func,
  onOutsideClick: PropTypes.func,

  // i18n
  monthFormat: PropTypes.string,
};

const defaultProps = {
  enableOutsideDays: false,
  numberOfMonths: 1,
  modifiers: {},
  orientation: HORIZONTAL_ORIENTATION,
  withPortal: false,
  hidden: false,
  initialVisibleMonth: () => moment().locale('en'),
  onDayClick() {},
  onDayMouseDown() {},
  onDayMouseUp() {},
  onDayMouseEnter() {},
  onDayMouseLeave() {},
  onDayTouchStart() {},
  onDayTouchTap() {},
  onDayTouchEnd() {},
  onPrevMonthClick() {},
  onNextMonthClick() {},
  onOutsideClick() {},

  // i18n
  monthFormat: 'MMMM YYYY',
};

export default class DayPicker extends React.Component {
  constructor(props) {
    super(props);

    this.hasSetInitialVisibleMonth = !props.hidden;
    this.state = {
      currentMonth: props.initialVisibleMonth(),
      monthTransition: null,
      translationValue: 0,
      start: "",
      end: "",
    };

    this.handlePrevMonthClick = this.handlePrevMonthClick.bind(this);
    this.handleNextMonthClick = this.handleNextMonthClick.bind(this);
    this.updateStateAfterMonthTransition = this.updateStateAfterMonthTransition.bind(this);

    this.onEndDateInputChange = this.onEndDateInputChange.bind(this);
    this.onStartDateInputChange = this.onStartDateInputChange.bind(this);
    this.handleSumbit = this.handleSumbit.bind(this);

    this.handleEndDateInputFocus = this.handleEndDateInputFocus.bind(this);
    this.handleStartDateInputFocus = this.handleStartDateInputFocus.bind(this);
  }

  onEndDateInputChange(end) {
    this.setState({end});
    this.props.onEndDateChange(end);
  }

  onStartDateInputChange(start) {
    this.setState({start});
    this.props.onStartDateChange(start);
  }

  handleStartDateInputFocus() {
    if (!this.state.start && !this.props.startDate) {
      const { startDatePlaceholder } = this.props;

      this.onStartDateInputChange(startDatePlaceholder);
    }
  }

  handleEndDateInputFocus() {
    if (!this.state.end && !this.props.endDate) {
      const { endDatePlaceholder } = this.props;

      this.onEndDateInputChange(this.props.endDatePlaceholder);
    }
  }

  componentDidMount() {
    if (this.isHorizontal()) {
      this.adjustDayPickerHeight();
      this.initializeDayPickerWidth();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.hasSetInitialVisibleMonth && !nextProps.hidden) {
      this.hasSetInitialVisibleMonth = true;
      this.setState({
        currentMonth: nextProps.initialVisibleMonth(),
        translationValue: this.getTranslationValue(),
      }, () => {
        this.updateStateAfterMonthTransition();
        this.adjustDayPickerHeight();
      });
    }

    if (nextProps.startDate) {
      this.setState({start: nextProps.startDate});
    }

    if (nextProps.endDate) {
      this.setState({end: nextProps.endDate});
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentDidUpdate() {
    if (this.state.monthTransition) {
      if (this.isHorizontal()) {
        this.adjustDayPickerHeight();
      }
    }
  }

  getMonthHeightByIndex(i) {
    return this.getMonthHeight(
      ReactDOM.findDOMNode(this.refs.transitionContainer).querySelectorAll('.CalendarMonth')[i]
    );
  }

  getMonthHeight(el) {
    const caption = el.querySelector('.js-CalendarMonth__caption');
    const grid = el.querySelector('.js-CalendarMonth__grid');

    // Need to separate out table children for FF
    // Add an additional +1 for the border
    return (
      this.calculateDimension(caption, 'height', true, true) +
      this.calculateDimension(grid, 'height') + 1
    );
  }

  applyTransformStyles(el, transform, opacity = '') {
    const transformStyles = getTransformStyles(transform);
    transformStyles.opacity = opacity;

    Object.keys(transformStyles).forEach((styleKey) => {
      // eslint-disable-next-line no-param-reassign
      el.style[styleKey] = transformStyles[styleKey];
    });
  }

  calculateDimension(el, axis, borderBox = false, withMargin = false) {
    if (!el) {
      return 0;
    }

    const axisStart = (axis === 'width') ? 'Left' : 'Top';
    const axisEnd = (axis === 'width') ? 'Right' : 'Bottom';

    // Only read styles if we need to
    const style = (!borderBox || withMargin) ? window.getComputedStyle(el) : {};

    // Offset includes border and padding
    let size = (axis === 'width') ? el.offsetWidth : el.offsetHeight;

    // Get the inner size
    if (!borderBox) {
      size -= (
        parseFloat(style[`padding${axisStart}`]) +
        parseFloat(style[`padding${axisEnd}`]) +
        parseFloat(style[`border${axisStart}Width`]) +
        parseFloat(style[`border${axisEnd}Width`])
      );
    }

    // Apply margin
    if (withMargin) {
      size += (
        parseFloat(style[`margin${axisStart}`]) +
        parseFloat(style[`margin${axisEnd}`])
      );
    }

    return size;
  }

  isHorizontal() {
    return this.props.orientation === HORIZONTAL_ORIENTATION;
  }

  isVertical() {
    return this.props.orientation === VERTICAL_ORIENTATION;
  }

  initializeDayPickerWidth() {
    this.dayPickerWidth = this.calculateDimension(
      ReactDOM.findDOMNode(this.refs.calendarMonthGrid).querySelector('.CalendarMonth'),
      'width',
      true
    );
  }

  updateStateAfterMonthTransition() {
    const { currentMonth, monthTransition } = this.state;

    let newMonth = currentMonth;
    if (monthTransition === PREV_TRANSITION) {
      newMonth = currentMonth.clone().subtract(1, 'month');
    } else if (monthTransition === NEXT_TRANSITION) {
      newMonth = currentMonth.clone().add(1, 'month');
    }

    // clear the previous transforms
    this.applyTransformStyles(
      ReactDOM.findDOMNode(this.refs.calendarMonthGrid).querySelector('.CalendarMonth'),
      'none'
    );

    this.setState({
      currentMonth: newMonth,
      monthTransition: null,
      translationValue: 0,
    });
  }

  getTranslationValue() {
    return this.isVertical() ? this.getMonthHeightByIndex(1) : this.dayPickerWidth;
  }

  handlePrevMonthClick(e) {
    if (e) e.preventDefault();

    if (this.props.onPrevMonthClick) {
      this.props.onPrevMonthClick(e);
    }

    // The first CalendarMonth is always positioned absolute at top: 0 or left: 0
    // so we need to transform it to the appropriate location before the animation.
    // This behavior is because we would otherwise need a double-render in order to
    // adjust the container position once we had the height the first calendar
    // (ie first draw all the calendar, then in a second render, use the first calendar's
    // height to position the container). Variable calendar heights, amirite? <3 Maja

    const translationValue =
          this.isVertical() ? this.getMonthHeightByIndex(0) : this.dayPickerWidth;

    this.translateFirstDayPickerForAnimation(translationValue);

    this.setState({
      monthTransition: PREV_TRANSITION,
      translationValue,
    });
  }

  handleNextMonthClick(e) {
    if (e) e.preventDefault();

    if (this.props.onNextMonthClick) {
      this.props.onNextMonthClick(e);
    }

    var translationValue = this.isVertical() ? -this.getMonthHeightByIndex(1) : -this.dayPickerWidth;

    this.setState({
      monthTransition: NEXT_TRANSITION,
      translationValue
    });
  }

  handleSumbit(input, event) {
    const {start, end} = this.state;
    event.preventDefault();
    startDate = moment(start, "MM/DD/YYYY HH:mm:ss", true)
    endDate = moment(end, "MM/DD/YYYY HH:mm:ss", true)

    if (input === "start") {
      this.props.onSubmit("startDate", {startDate, endDate});

      if(startDate.isValid()) {
        this.endInputRef.focus();
      }

    } else if (input === "end") {
      this.props.onSubmit("endDate", {startDate, endDate});

      if (endDate.isValid() && endDate.isAfter(startDate)) {
        this.startInputRef.focus();
      }
    }
  }

  adjustDayPickerHeight() {
    const transitionContainer = ReactDOM.findDOMNode(this.refs.transitionContainer);
    const heights = [];

    // convert node list to array
    [...transitionContainer.querySelectorAll('.CalendarMonth')].forEach((el) => {
      if (el.getAttribute('data-visible') === 'true') {
        heights.push(this.getMonthHeight(el));
      }
    });

    const newMonthHeight = Math.max(...heights) + MONTH_PADDING;

    if (newMonthHeight !== this.calculateDimension(transitionContainer, 'height')) {
      this.monthHeight = newMonthHeight;
      transitionContainer.style.height = `${newMonthHeight}px`;
    }
  }

  translateFirstDayPickerForAnimation(translationValue) {
    const transformType = this.isVertical() ? 'translateY' : 'translateX';
    const transformValue = `${transformType}(-${translationValue}px)`;

    this.applyTransformStyles(
      ReactDOM.findDOMNode(this.refs.transitionContainer).querySelector('.CalendarMonth'),
      transformValue,
      1
    );
  }

  renderNavigation() {
    const isVertical = this.isVertical();

    return (
      <div className="DayPicker__nav">
        <span
          className="DayPicker__nav--prev"
          onClick={this.handlePrevMonthClick}
        >
          {isVertical ? <ChevronUp /> : <LeftArrow />}
        </span>

        <span
          className="DayPicker__nav--next"
          onClick={this.handleNextMonthClick}
        >
          {isVertical ? <ChevronDown /> : <RightArrow />}
        </span>
      </div>
    );
  }

  renderWeekHeader(index) {
    const { numberOfMonths } = this.props;

    const widthPercentage = 100 / numberOfMonths;
    const horizontalStyle = {
      width: `${widthPercentage}%`,
      left: `${widthPercentage * index}%`,
    };

    const style = this.isHorizontal() ? horizontalStyle : {};

    const header = [];
    for (let i = 0; i < 7; i++) {
      header.push(
        <li key={i}>
          <small>{moment().locale('en').weekday(i).format('dd')}</small>
        </li>
      );
    }

    return (
      <div
        className="DayPicker__week-header"
        key={`week-${index}`}
        style={style}
      >
        <ul>
          {header}
        </ul>
      </div>
    );
  }

  render() {
    const { currentMonth, monthTransition, translationValue, start, end } = this.state;
    const {
      enableOutsideDays,
      numberOfMonths,
      orientation,
      modifiers,
      withPortal,
      onDayClick,
      onDayMouseDown,
      onDayMouseUp,
      onDayTouchStart,
      onDayTouchEnd,
      onDayTouchTap,
      onDayMouseEnter,
      onDayMouseLeave,
      onOutsideClick,
      monthFormat,
      mode,
      onStartDateChange,
      onEndDateChange,
      startDate,
      endDate,
      onSubmit,
      startDatePlaceholder,
      endDatePlaceholder,
    } = this.props;

    const numOfWeekHeaders = this.isVertical() ? 1 : numberOfMonths;
    const weekHeaders = [];
    for (let i = 0; i < numOfWeekHeaders; i++) {
      weekHeaders.push(this.renderWeekHeader(i));
    }

    let firstVisibleMonthIndex = 1;
    if (monthTransition === PREV_TRANSITION) {
      firstVisibleMonthIndex -= 1;
    } else if (monthTransition === NEXT_TRANSITION) {
      firstVisibleMonthIndex += 1;
    }

    const dayPickerClassNames = cx('DayPicker', {
      'DayPicker--horizontal': this.isHorizontal(),
      'DayPicker--vertical': this.isVertical(),
      'DayPicker--portal': withPortal,
    });

    const transitionContainerClasses = cx('transition-container', {
      'transition-container--horizontal': this.isHorizontal(),
      'transition-container--vertical': this.isVertical(),
    });

    const horizontalWidth = (CALENDAR_MONTH_WIDTH * numberOfMonths) + (2 * DAY_PICKER_PADDING);

    // this is a kind of made-up value that generally looks good. we'll
    // probably want to let the user set this explicitly.
    const verticalHeight = 1.75 * CALENDAR_MONTH_WIDTH;

    const dayPickerStyle = {
      width: this.isHorizontal() && horizontalWidth,

      // These values are to center the datepicker (approximately) on the page
      marginLeft: this.isHorizontal() && withPortal && -horizontalWidth / 2,
      marginTop: this.isHorizontal() && withPortal && -CALENDAR_MONTH_WIDTH / 2,
    };

    const transitionContainerStyle = {
      width: this.isHorizontal() && horizontalWidth,
      height: this.isVertical() && !withPortal && verticalHeight,
    };

    const isCalendarMonthGridAnimating = monthTransition !== null;
    const transformType = this.isVertical() ? 'translateY' : 'translateX';
    const transformValue = `${transformType}(${translationValue}px)`;

    return (
      <div className={dayPickerClassNames} style={dayPickerStyle} >
        <OutsideClickHandler onOutsideClick={onOutsideClick}>
          {this.renderNavigation()}

          <div className="DayPicker__week-headers">
            {weekHeaders}
          </div>

          <div
            className={transitionContainerClasses}
            ref="transitionContainer"
            style={transitionContainerStyle}
          >
            <CalendarMonthGrid
              ref="calendarMonthGrid"
              transformValue={transformValue}
              enableOutsideDays={enableOutsideDays}
              firstVisibleMonthIndex={firstVisibleMonthIndex}
              initialMonth={currentMonth}
              isAnimating={isCalendarMonthGridAnimating}
              modifiers={modifiers}
              orientation={orientation}
              withPortal={withPortal}
              numberOfMonths={numberOfMonths}
              onDayClick={onDayClick}
              onDayMouseDown={onDayMouseDown}
              onDayMouseUp={onDayMouseUp}
              onDayTouchStart={onDayTouchStart}
              onDayTouchEnd={onDayTouchEnd}
              onDayTouchTap={onDayTouchTap}
              onDayMouseEnter={onDayMouseEnter}
              onDayMouseLeave={onDayMouseLeave}
              onMonthTransitionEnd={this.updateStateAfterMonthTransition}
              monthFormat={monthFormat}
            />
          </div>

          {mode === "range" &&
              <div className={"DayPicker__input-wrapper"}>
                <div className={"DayPicker__input-group"}>
                  <label htmlFor={"from-time"} >FROM </label>
                  <form onSubmit={(e) => this.handleSumbit("start", e)}>
                  <input
                    id={"from-time"}
                    name={"from-time"}
                    className={cx("DayPicker__input", {invalid: this.props.error.start})}
                    type="text"
                    ref={(ref) => { this.startInputRef = ref; }}
                    value={start || startDate || ""}
                    onChange={(e) => this.onStartDateInputChange(e.target.value)}
                    onFocus={this.handleStartDateInputFocus}
                    placeholder={startDatePlaceholder}
                    autoComplete="off"
                    maxLength={20}
                  />
                  </form>
                </div>

                <div className={"DayPicker__input-group"}>
                  <label htmlFor={"to-time"} >TO</label>
                  <form onSubmit={(e) => this.handleSumbit("end", e)}>
                  <input
                    id={"to-time"}
                    name={"to-time"}
                    className={cx("DayPicker__input", {invalid: this.props.error.end})}
                    type="text"
                    ref={(ref) => { this.endInputRef = ref; }}
                    value={end || endDate || ""}
                    onChange={(e) => this.onEndDateInputChange(e.target.value)}
                    onKeyDown={() => {}}
                    onFocus={this.handleEndDateInputFocus}
                    placeholder={endDatePlaceholder}
                    autoComplete="off"
                  />
                  </form>
                </div>
              </div>
          }

        </OutsideClickHandler>
      </div>
    );
  }
}

DayPicker.propTypes = propTypes;
DayPicker.defaultProps = defaultProps;
