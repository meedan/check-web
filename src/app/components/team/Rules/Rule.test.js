/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../../../test/unit/helpers/intl-test';
import Rule from './Rule';
import schema from './../../../../../test/unit/mocks/rules-schema';
import rules from './../../../../../test/unit/mocks/rules';

const CommonProps = {
  schema,
  unsavedChanges: false,
  onGoBack: () => {},
  onDeleteRule: () => {},
  onDuplicateRule: () => {},
  onSaveRule: () => {},
  onChangeRule: () => {},
};

describe('<Rule />', () => {
  it('should render fields for one rule', () => {
    const wrapper = mountWithIntlProvider(<Rule {...CommonProps} rule={rules[0]} />);
    expect(wrapper.find('input').hostNodes()).toHaveLength(9);
  });

  it('should render fields for another rule', () => {
    const wrapper = mountWithIntlProvider(<Rule {...CommonProps} rule={rules[1]} />);
    expect(wrapper.find('input').hostNodes()).toHaveLength(8);
  });
});
