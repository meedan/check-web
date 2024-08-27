import React from 'react';
import { ApiKeys } from './ApiKeys';
import { mountWithIntl, shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import StyledBlankState from '../layout/BlankState';

const teamWithoutApiKeys = { api_keys: { edges: [] } };
const teamWithApiKeys = {
  api_keys: {
    edges: [
      { node: { dbid: 1, title: 'a', description: 'aa', user: { name: 'j. doe' } } }, // eslint-disable-line object-curly-newline
      { node: { dbid: 2, title: 'b', description: 'bb', user: { name: 'g. joe' } } }, // eslint-disable-line object-curly-newline
      { node: { dbid: 3, title: 'c', description: 'cc', user: { name: 'a. poe' } } }, // eslint-disable-line object-curly-newline
    ],
  },
};

describe('<ApiKeys />', () => {
  it('should render empty state', () => {
    const wrapper = mountWithIntl(<ApiKeys team={teamWithoutApiKeys} />);
    expect(wrapper.find('.api-keys').hostNodes()).toHaveLength(1);
    expect(wrapper.find(StyledBlankState)).toHaveLength(1);
  });

  it('should render each api key', () => {
    const wrapper = shallowWithIntl(<ApiKeys team={teamWithApiKeys} />);
    expect(wrapper.find('ForwardRef(Relay(ApiKeyEntry))')).toHaveLength(3);
    expect(wrapper.find(StyledBlankState)).toHaveLength(0);
  });
});
