import React from 'react';
import { mountWithIntl } from './helpers/intl-test';

import GeolocationTaskResponse from '../../src/app/components/task/GeolocationTaskResponse';

describe('<GeolocationTaskResponse />', () => {
  const response = '{"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{"name":"A Place"}}';

  it('Renders response', () => {
    const taskResponse = mountWithIntl(<GeolocationTaskResponse response={response} />);
    expect(taskResponse.find('.task__response')).toHaveLength(1);
  });

  it('Returns null if no response', () => {
    const taskResponse = mountWithIntl(<GeolocationTaskResponse />);
    expect(taskResponse.html()).toEqual(null);
  });
});
