import React from 'react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import DateRangeFilter, { getUTCOffset } from './DateRangeFilter';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

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

    expect(wrapper.find('select').first().props().value).toBe('created_at');
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
    expect(wrapper.find('select').first().length).toBe(0);
  });

  it('should show alternate filters', () => {
    const wrapper = mountWithIntl(
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <DateRangeFilter
          classes={{}}
          value={{
            report_published_at: {
              start_time: '',
              end_time: '',
            },
          }}
          onChange={() => {}}
          onRemove={() => {}}
        />
      </MuiPickersUtilsProvider>,
    );

    expect(wrapper.find('select').first().props().value).toBe('report_published_at');
  });

  it('should calculate UTC offset for start', () => {
    const isoDateTimeString = '2023-02-14T08:00:00.000Z'; // location: Portland, Oregon
    const isStart = true;
    const result = getUTCOffset(isoDateTimeString, isStart);

    expect(result).toBe('UTC-8:00');
  });

  it('should calculate UTC offset for end time in ', () => {
    const isoDateTimeString = '2023-03-14T14:59:59.000Z'; // location: Tokyo
    const isStart = false;
    const result = getUTCOffset(isoDateTimeString, isStart);

    expect(result).toBe('UTC+9:00');
  });

  it('should calculate UTC offset for timezones with minute offsets', () => {
    const isoDateTimeString = '2024-04-09T18:29:59.000Z'; // location: Mumbai
    const isStart = false;
    const result = getUTCOffset(isoDateTimeString, isStart);

    expect(result).toBe('UTC+5:30');
  });
});
