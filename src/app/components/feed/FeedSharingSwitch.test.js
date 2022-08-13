import React from 'react';
import FeedSharingSwitch from './FeedSharingSwitch';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';

describe('<FeedSharingSwitch />', () => {
  it('should be enabled', () => {
    const component = mountWithIntlProvider(<FeedSharingSwitch feedTeamId="123\n" enabled />);
    expect(component.find('.MuiSwitch-input[checked=true]').length).toEqual(1);
  });

  it('should be disabled', () => {
    const component = mountWithIntlProvider(<FeedSharingSwitch feedTeamId="123\n" enabled={false} />);
    expect(component.find('.MuiSwitch-input[checked=true]').length).toEqual(0);
  });
});
