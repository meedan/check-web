import React from 'react';
import TranslateStatuses from './TranslateStatuses';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

const statuses = [
  {
    id: '1',
    locales: {
      en: { label: 'False' },
      pt: { label: 'falso' },
    },
    label: 'false',
    style: { color: 'red' },
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
      currentLanguage="pt"
      defaultLanguage="en"
      statuses={statuses}
      onSubmit={() => {}}
    />);
    expect(wrapper.html()).toMatch('False');
    expect(wrapper.html()).toMatch('True');
    expect(wrapper.html()).toMatch('In Progress');
    expect(wrapper.find('#translate-statuses__input-1').at(1).prop('defaultValue')).toEqual('falso');
    expect(wrapper.find('#translate-statuses__input-2').at(1).prop('defaultValue')).toEqual('verdadeiro');
    expect(wrapper.find('#translate-statuses__input-3').at(1).prop('defaultValue')).toEqual('em progresso');
    expect(wrapper.find('.test__status-message').hostNodes()).toHaveLength(0);
    expect(wrapper.find('.translate-statuses__message').hostNodes()).toHaveLength(0);
  });

  it('should render statues message and the field to translate message', () => {
    const wrapper = mountWithIntl(<TranslateStatuses
      currentLanguage="pt"
      defaultLanguage="en"
      statuses={statuses2}
      onSubmit={() => {}}
    />);
    expect(wrapper.html()).toMatch('False');
    expect(wrapper.find('#translate-statuses__input-1').at(0).prop('defaultValue')).toEqual('falso');
    expect(wrapper.find('.test__status-message').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('message to be sent to the users');
    expect(wrapper.find('.translate-statuses__message').hostNodes()).toHaveLength(1);
  });
});
