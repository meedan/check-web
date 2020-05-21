/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from './helpers/intl-test';

import GeolocationRespondTask from '../../src/app/components/task/GeolocationRespondTask';

describe('<GeolocationRespondTask />', () => {
  const response = '{"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{"name":"A Place"}}';

  it('Renders inputs', () => {
    const wrapper = mountWithIntlProvider(<GeolocationRespondTask response={response} />);

    expect(wrapper.find('input#geolocationsearch')).toHaveLength(1);
    expect(wrapper.find('textarea#task__response-geolocation-name')).toHaveLength(1);
    expect(wrapper.find('input#task__response-geolocation-coordinates')).toHaveLength(1);
  });

  it('Renders error for invalid coordinates', () => {
    const wrapper = mountWithIntlProvider(<GeolocationRespondTask />);

    wrapper.find('#task__response-geolocation-coordinates')
      .hostNodes().simulate('change', { target: { name: 'coordinates', value: 'This is not a valid gps position' } });
    wrapper.find('#task__response-geolocation-coordinates').hostNodes().simulate('blur');

    expect(wrapper.html()).toContain('Invalid coordinates');
  });

  it('Does not render error for valid coordinates', () => {
    const wrapper = mountWithIntlProvider(<GeolocationRespondTask />);

    wrapper.find('#task__response-geolocation-coordinates')
      .hostNodes().simulate('change', { target: { name: 'coordinates', value: '-13, -38' } });
    wrapper.find('#task__response-geolocation-coordinates').hostNodes().simulate('blur');

    expect(wrapper.html()).not.toContain('Invalid coordinates');
  });
});
