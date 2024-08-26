import React from 'react';
import { ApiKeyEntry } from './ApiKeyEntry';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';

const expiredKey = {
  id: '123xyz',
  title: 'Test API Key',
  access_token: 'babysharkdododoo',
  created_at: '951004800',
  expire_at: new Date('2002-02-20').toISOString(),
  user: {
    name: 'Daddy Shark',
  },
};

const activeKey = {
  id: '123xyz',
  title: 'Test API Key',
  access_token: 'babysharkdododoo',
  created_at: '951004800',
  expire_at: new Date('2099-02-20').toISOString(),
  user: {
    name: 'Daddy Shark',
  },
};

describe('<ApiKeyEntry />', () => {
  it('should render an active api key', () => {
    const wrapper = shallowWithIntl(<ApiKeyEntry apiKey={activeKey} />);
    expect(wrapper.find('.api-key').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.api-key__textfield[value="babysharkdododoo"]')).toHaveLength(1);
    expect(wrapper.find('.api-key__textfield[value="babysharkdododoo"][disabled=true]')).toHaveLength(0);
    expect(wrapper.find(ButtonMain).props().disabled).toEqual(false);
  });

  it('should render an expired api key', () => {
    const wrapper = shallowWithIntl(<ApiKeyEntry apiKey={expiredKey} />);
    expect(wrapper.find('.api-key').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.api-key__textfield[value="babysharkdododoo"]')).toHaveLength(1);
    expect(wrapper.find('.api-key__textfield[value="babysharkdododoo"][disabled=true]')).toHaveLength(1);
    expect(wrapper.find(ButtonMain).props().disabled).toEqual(true);
  });
});
