import React from 'react';
import RulesComponent from './RulesComponent';
import schema from './../../../../../test/unit/mocks/rules-schema';
import rules from './../../../../../test/unit/mocks/rules';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

const team = {
  get_rules: rules,
  rules_json_schema: JSON.stringify(schema),
};

describe('<RulesComponent />', () => {
  it('should render one table row per rule', () => {
    const wrapper = mountWithIntl(<RulesComponent team={team} />);
    expect(wrapper.find('tr').hostNodes()).toHaveLength(3); // one row for the header
  });

  it('should show rule names on the table', () => {
    const wrapper = mountWithIntl(<RulesComponent team={team} />);
    expect(wrapper.text()).toMatch('Rule 1');
    expect(wrapper.text()).toMatch('Rule 2');
  });
});
