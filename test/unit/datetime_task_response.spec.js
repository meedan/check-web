import React from 'react';
import { mountWithIntl } from './helpers/intl-test';

import DatetimeTaskResponse from '../../src/app/components/task/DatetimeTaskResponse';

describe('<DatetimeTaskResponse />', () => {
  const response = '2018-03-27 12:34 -3 BRT';
  const badResponse = 'NaN-NaN-NaN 0:0 0 GMT notime';

  it('Renders date', () => {
    const taskResponse = mountWithIntl(<DatetimeTaskResponse response={response} />);
    expect(taskResponse.html()).toMatch('March 27, 2018');
  });

  it('Renders date and time', () => {
    const taskResponse = mountWithIntl(<DatetimeTaskResponse response={response} />);
    expect(taskResponse.html()).toMatch('<span class="task__datetime-response"><span><span>March 27, 2018</span> at <a href="https://time.is/2018-03-27 12:34 BRT" target="_blank" rel="noreferrer noopener" title="View this timezone on time.is">12:34 BRT</a></span></span>');
  });

  // Mantis #6787: Item shows as blank, possibly related to date/time task
  it('Displays error if bad data', () => {
    const taskResponse = mountWithIntl(<DatetimeTaskResponse response={badResponse} />);
    expect(taskResponse.html()).toMatch('Error: Invalid timestamp');
  });

  it('Returns null if no response', () => {
    const taskResponse = mountWithIntl(<DatetimeTaskResponse />);
    expect(taskResponse.html()).toEqual('');
  });
});
