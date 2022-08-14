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

  it('should have a tooltip if read-only', () => {
    const component1 = mountWithIntlProvider(<FeedSharingSwitch feedTeamId="123\n" enabled={false} />);
    expect(component1.find('.MuiTooltip-popper').length).toEqual(0);

    const component2 = mountWithIntlProvider(<FeedSharingSwitch feedTeamId="123\n" enabled={false} readOnly />);
    expect(component2.find('.MuiTooltip-popper').length).toEqual(1);
  });
});
