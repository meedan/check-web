import React from 'react';
import ContentWarningMessage from './ContentWarningMessage';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('ContentWarningMessage', () => {
  it('should render message for content detected by automated rule', () => {
    const wrapper = mountWithIntl(<ContentWarningMessage
      intl={{}}
      warningCategory="adult"
      warningCreator="Alegre"
    />);
    expect(wrapper.text()).toMatch(/An automation rule has detected this content as sensitive/);
  });

  it('should render message for content flagged as SPAM by Smooch Bot', () => {
    const wrapper = mountWithIntl(<ContentWarningMessage
      intl={{}}
      warningCategory="spam"
      warningCreator="Smooch"
    />);
    expect(wrapper.text()).toMatch(/This content has been flagged as SPAM because the user was blocked due to sending excessive messages/);
  });

  it('should render message for content flagged as SPAM with no warning creator', () => {
    const wrapper = mountWithIntl(<ContentWarningMessage
      intl={{}}
      warningCategory="spam"
      warningCreator=""
    />);
    expect(wrapper.text()).toMatch(/This content has been flagged as SPAM because the user was blocked due to sending excessive messages/);
  });

  it('should render message for content detected by a specific user', () => {
    const wrapper = mountWithIntl(<ContentWarningMessage
      intl={{}}
      warningCategory="violence"
      warningCreator="test user"
    />);
    expect(wrapper.text()).toMatch(/test user has detected this content as Violence/);
  });
});
