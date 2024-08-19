import React from 'react';
import DatetimeTaskResponse from './DatetimeTaskResponse';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';


describe('<DatetimeTaskResponse />', () => {
  it('Renders date', () => {
    const taskResponse = mountWithIntlProvider((
      <DatetimeTaskResponse response="2018-03-27 12:34 -3 BRT notime" />
    ));
    expect(taskResponse.text()).toEqual('March 27, 2018');
  });

  it('Renders date and time', () => {
    const taskResponse = mountWithIntlProvider((
      <DatetimeTaskResponse response="2018-03-27 12:34 -3 BRT" />
    ));
    expect(taskResponse.text()).toEqual('March 27, 2018, 12:34 PM BRT');
  });

  // Mantis #6787: Item shows as blank, possibly related to date/time task
  it('Displays error if bad data', () => {
    const taskResponse = mountWithIntlProvider((
      <DatetimeTaskResponse response="not a time" />
    ));
    expect(taskResponse.text()).toEqual('Error: Invalid timestamp');
  });

  it('Returns null if no response', () => {
    const taskResponse = mountWithIntlProvider(<DatetimeTaskResponse response={null} />);
    expect(taskResponse.html()).toBeNull();
  });
});
