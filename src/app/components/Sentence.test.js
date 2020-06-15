/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../test/unit/helpers/intl-test';
import Sentence from './Sentence';

describe('<Sentence />', () => {
  it('should mount empty string if list is empty', () => {
    const wrapper = mountWithIntlProvider(<Sentence list={[]} />);
    expect(wrapper.html()).toEqual(null);
  });

  it('should mount element if list has only one element', () => {
    const wrapper = mountWithIntlProvider(<Sentence list={['Test']} />);
    expect(wrapper.text()).toEqual('Test');
  });

  it('should mount two elements', () => {
    const wrapper = mountWithIntlProvider(<Sentence list={['Foo', 'Bar']} />);
    expect(wrapper.text()).toEqual('Foo and Bar');
  });

  it('should mount three elements', () => {
    const wrapper = mountWithIntlProvider(<Sentence list={['A', 'B', 'C']} />);
    expect(wrapper.text()).toEqual('A, B and C');
  });

  it('should mount four elements', () => {
    const wrapper = mountWithIntlProvider(<Sentence list={['A', 'B', 'C', 'D']} />);
    expect(wrapper.text()).toEqual('A, B, C and D');
  });
});
