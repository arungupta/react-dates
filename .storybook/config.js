import moment from 'moment';
import { configure, addDecorator } from '@kadira/storybook';

import aphroditeInterface from 'react-with-styles-interface-aphrodite';
import ThemedStyleSheet from 'react-with-styles/lib/ThemedStyleSheet';

import '../css/styles.scss';

const DefaultTheme = {
  reactDates: {
    color: {
      white: '#fff',
      border_input: '#dbdbdb',
      caption: '#3c3f40',
      border_day: '#e4e7e7',
      border_day_hovered: '#d4d9d9',
      background_day_active: '#f2f2f2',
      text_day: '#565a5c',
    },

  },
};

ThemedStyleSheet.registerDefaultTheme(DefaultTheme);
ThemedStyleSheet.registerInterface(aphroditeInterface);

addDecorator((story) => {
  moment.locale('en');
  return (story());
});

function loadStories() {
  require('../stories/DateRangePicker');
  require('../stories/SingleDatePicker');
  require('../stories/DayPicker');
}

configure(loadStories, module);
