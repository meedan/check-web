import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import RequestSubscription from './RequestSubscription';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<RequestSubscription />', () => {
  it('should render check mark icon and date', () => {
    const wrapper = mountWithIntl(<RequestSubscription lastCalledAt="2022-10-19T20:53:04.500Z" />);
    expect(wrapper.find(CheckIcon).length).toEqual(1);
    expect(wrapper.html()).toMatch('Oct 19, 2022');
  });

  it('should render bell icon', () => {
    const wrapper = mountWithIntl(<RequestSubscription subscribed={true} />);
    expect(wrapper.find(NotificationsNoneIcon).length).toEqual(1);
  });
});
