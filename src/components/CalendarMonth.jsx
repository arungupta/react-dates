import React, { PropTypes } from 'react';
import momentPropTypes from 'react-moment-proptypes';
import { css, withStyles } from 'react-with-styles';
import moment from 'moment';
import cx from 'classnames';

import CalendarDay from './CalendarDay';

import getCalendarMonthWeeks from '../utils/getCalendarMonthWeeks';

import OrientationShape from '../shapes/OrientationShape';

import { HORIZONTAL_ORIENTATION, VERTICAL_ORIENTATION } from '../../constants';

const propTypes = {
  month: momentPropTypes.momentObj,
  isVisible: PropTypes.bool,
  enableOutsideDays: PropTypes.bool,
  modifiers: PropTypes.object,
  orientation: OrientationShape,
  onDayClick: PropTypes.func,
  onDayMouseDown: PropTypes.func,
  onDayMouseUp: PropTypes.func,
  onDayMouseEnter: PropTypes.func,
  onDayMouseLeave: PropTypes.func,
  onDayTouchStart: PropTypes.func,
  onDayTouchEnd: PropTypes.func,
  onDayTouchTap: PropTypes.func,
  styles: PropTypes.object.isRequired,

  // i18n
  monthFormat: PropTypes.string,
};

const defaultProps = {
  month: moment(),
  isVisible: true,
  enableOutsideDays: false,
  modifiers: {},
  orientation: HORIZONTAL_ORIENTATION,
  onDayClick() {},
  onDayMouseDown() {},
  onDayMouseUp() {},
  onDayMouseEnter() {},
  onDayMouseLeave() {},
  onDayTouchStart() {},
  onDayTouchEnd() {},
  onDayTouchTap() {},

  // i18n
  monthFormat: 'MMMM YYYY', // english locale
};

export function getModifiersForDay(modifiers, day) {
  return day ? Object.keys(modifiers).filter(key => modifiers[key](day)) : [];
}

function CalendarMonth(props) {
  const {
    month,
    monthFormat,
    orientation,
    isVisible,
    modifiers,
    enableOutsideDays,
    onDayClick,
    onDayMouseDown,
    onDayMouseUp,
    onDayMouseEnter,
    onDayMouseLeave,
    onDayTouchStart,
    onDayTouchEnd,
    onDayTouchTap,
    styles,
  } = props;
  const monthTitle = month.format(monthFormat);

  return (
    <div
      {...css(
        styles.component,
        orientation === HORIZONTAL_ORIENTATION && styles.component_horizontal,
        orientation === VERTICAL_ORIENTATION && styles.component_vertical
      )}
      data-visible={isVisible}
    >
      <table {...css(styles.table)}>
        <caption {...css(styles.caption)}>
          <strong>{monthTitle}</strong>
        </caption>

        <tbody>
          {getCalendarMonthWeeks(month, enableOutsideDays).map((week, i) =>
            <tr key={i}>
              {week.map((day, j) => {
                const modifiersForDay = getModifiersForDay(modifiers, day);

                const isOutsideDay = !day || day.month() !== month.month();
                const dayStyles = css(
                  styles.day,
                  isOutsideDay && styles.day_outside,
                  modifiersForDay.map(mod => styles[`day_${mod}`])
                );

                return (
                  <td {...dayStyles} key={j}>
                    {day &&
                      <CalendarDay
                        day={day}
                        modifiers={modifiersForDay}
                        onDayMouseEnter={onDayMouseEnter}
                        onDayMouseLeave={onDayMouseLeave}
                        onDayMouseDown={onDayMouseDown}
                        onDayMouseUp={onDayMouseUp}
                        onDayClick={onDayClick}
                        onDayTouchStart={onDayTouchStart}
                        onDayTouchEnd={onDayTouchEnd}
                        onDayTouchTap={onDayTouchTap}
                      />
                    }
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

CalendarMonth.propTypes = propTypes;
CalendarMonth.defaultProps = defaultProps;

export default withStyles(({ reactDates }) => ({
  component: {
    textAlign: 'center',
    padding: '0 13px',
    verticalAlign: 'top',
  },

  component_horizontal: {
    display: 'inline-block',
    minHeight: '100%',
  },

  component_vertical: {
    display: 'block',
  },

  table: {
    borderCollapse: 'collapse',
    borderSpacing: 0,
  },

  caption: {
    color: reactDates.color.caption,
    marginTop: 7,
    fontSize: 18,
    padding: '15px 0 35px',
    textAlign: 'center',
    marginBottom: 2,
  },

  day: {
    border: `1px solid ${reactDates.color.border_day}`,
    padding: 0,
    boxSizing: 'border-box',
    color: reactDates.color.text_day,
    cursor: 'pointer',

    // this should probs be a prop
    width: 39,
    height: 38,

    ':active': {
      background: reactDates.color.background_day_active,
    },
  },

  day_outside: {
    border: 0,
    cursor: 'default',

    ':active': {
      background: reactDates.color.white,
    },
  },

  day_hovered: {
    background: reactDates.color.border_day,
    border: `1px double ${reactDates.color.border_day_hovered}`,
    color: 'inherit',
  },

  'day_blocked-minimum-nights': {
//   color: $react-dates-color-gray-lighter;
//   background: $react-dates-color-white;
//   border: 1px solid lighten($react-dates-color-border-light, 3);
//   cursor: default;

//   &:active {
//     background: $react-dates-color-white;
//   }
  },

  'day_selected-span': {
//   background: $react-dates-color-primary-shade-2;
//   border: 1px double $react-dates-color-primary-shade-1;
//   color: $react-dates-color-white;

//   &.CalendarMonth__day--hovered,
//   &:active {
//     background: $react-dates-color-primary-shade-1;
//     border: 1px double $react-dates-color-primary;
//   }

//   &.CalendarMonth__day--last-in-range {
//     border-right: $react-dates-color-primary;
//   }
  },

// .DateRangePicker__picker--valid-date-hovered {
//   .CalendarMonth__day--hovered-span,
//   .CalendarMonth__day--after-hovered-start {
//     background: $react-dates-color-primary-shade-4;
//     border: 1px double $react-dates-color-primary-shade-3;
//     color: $react-dates-color-secondary;
//   }
// }

// .DateRangePicker__picker--valid-date-hovered .CalendarMonth__day--selected-start,
// .DateRangePicker__picker--valid-date-hovered .CalendarMonth__day--selected-end,
// .CalendarMonth__day--selected-start,
// .CalendarMonth__day--selected-end,
// .CalendarMonth__day--selected {
//   background: $react-dates-color-primary;
//   border: 1px double $react-dates-color-primary;
//   color: $react-dates-color-white;

//   &:active {
//     background: $react-dates-color-primary;
//   }
// }

// .CalendarMonth__day--blocked-calendar {
//   background: $react-dates-color-gray-lighter;
//   color: $react-dates-color-gray-light;
//   cursor: default;

//   &:active {
//     background: $react-dates-color-gray-lighter;
//   }
// }

// .CalendarMonth__day--blocked-out-of-range {
//   color: $react-dates-color-gray-lighter;
//   background: $react-dates-color-white;
//   border: 1px solid lighten($react-dates-color-border-light, 3);
//   cursor: default;

//   &:active {
//     background: $react-dates-color-white;
//   }
// }

}))(CalendarMonth);
