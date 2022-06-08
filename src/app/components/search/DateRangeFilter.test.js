import React from 'react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import DateRangeFilter from './DateRangeFilter';

describe('<DateRangeFilter />', () => {
  it('should render basic filter', () => {
    const wrapper = mountWithIntl(
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <DateRangeFilter
          classes={{}}
          value={{
            created_at: {
              start_time: '',
              end_time: '',
            },
          }}
          onChange={() => {}}
          onRemove={() => {}}
        />
      </MuiPickersUtilsProvider>,
    );

    expect(wrapper.find('input[value="created_at"]').length).toBe(1);
  });

  it('should hide filter', () => {
    const wrapper = mountWithIntl(
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <DateRangeFilter
          classes={{}}
          hide
          value={{
            created_at: {
              start_time: '',
              end_time: '',
            },
          }}
          onChange={() => {}}
          onRemove={() => {}}
        />
      </MuiPickersUtilsProvider>,
    );

    expect(wrapper.find('input[value="created_at"]').length).toBe(0);
  });

  it('should show alternate filters', () => {
    const wrapper = mountWithIntl(
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <DateRangeFilter
          classes={{}}
          value={{
            media_published_at: {
              start_time: '',
              end_time: '',
            },
          }}
          onChange={() => {}}
          onRemove={() => {}}
        />
      </MuiPickersUtilsProvider>,
    );

    expect(wrapper.find('input[value="media_published_at"]').length).toBe(1);
    expect(wrapper.find('input[value="created_at"]').length).toBe(0);
  });
});
