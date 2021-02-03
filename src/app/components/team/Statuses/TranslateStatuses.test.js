import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import TranslateStatuses from './TranslateStatuses';

const statuses = [
  {
    id: '1',
    locales: {
      en: { label: 'False' },
      pt: { label: 'falso' },
    },
    label: 'false',
    style: { color: 'red', height: '100px' },
  },
  {
    id: '2',
    locales: {
      en: { label: 'True' },
      pt: { label: 'verdadeiro' },
    },
    style: { color: 'black' },
    label: 'true',
  },
  {
    id: '3',
    locales: {
      en: { label: 'In Progress' },
      pt: { label: 'em progresso' },
    },
    style: { color: 'black' },
    label: 'in progress',
  },
];

const statuses2 = [
  {
    id: '1',
    locales: {
      en: { label: 'False', message: 'message to be sent to the users' },
      pt: { label: 'falso' },
    },
    label: 'false',
    style: { color: 'red' },
    should_send_message: true,
  },
];

describe('<TranslateStatuses/>', () => {
  it('should render all the statuses and the translation options', () => {
    const wrapper = mountWithIntl(<TranslateStatuses
      statuses={statuses}
      defaultLanguage="en"
      currentLanguage="pt"
      onSubmit={() => {}}
    />);
    expect(wrapper.html()).toMatch('False');
    expect(wrapper.html()).toMatch('True');
    expect(wrapper.html()).toMatch('In Progress');
    expect(wrapper.find('#translate-statuses__input-1').at(0).prop('defaultValue')).toEqual('falso');
    expect(wrapper.find('#translate-statuses__input-2').at(1).prop('defaultValue')).toEqual('verdadeiro');
    expect(wrapper.find('#translate-statuses__input-3').at(2).prop('defaultValue')).toEqual('em progresso');
    expect(wrapper.find('.status-message').hostNodes()).toHaveLength(0);
    expect(wrapper.find('.translate-statuses__message').hostNodes()).toHaveLength(0);
  });

  it('should render statues message and the field to translate message', () => {
    const wrapper = mountWithIntl(<TranslateStatuses
      statuses={statuses2}
      defaultLanguage="en"
      currentLanguage="pt"
      onSubmit={() => {}}
    />);
    expect(wrapper.html()).toMatch('False');
    expect(wrapper.find('#translate-statuses__input-1').at(0).prop('defaultValue')).toEqual('falso');
    expect(wrapper.find('.status-message').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('message to be sent to the users');
    expect(wrapper.find('.translate-statuses__message').hostNodes()).toHaveLength(1);
  });
});
