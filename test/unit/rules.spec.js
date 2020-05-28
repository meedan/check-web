import React from 'react';
import { IntlProvider } from 'react-intl';
import { mountWithIntl } from './helpers/intl-test';
import RulesComponent from './../../src/app/components/team/Rules/RulesComponent';
import schema from './mocks/rules-schema';
import rules from './mocks/rules';

const team = {
  get_rules: rules,
  rules_json_schema: JSON.stringify(schema),
};

describe('<RulesComponent />', () => {
  it('should render one table row per rule', function() {
    const wrapper = mountWithIntl(
      <RulesComponent team={team} />
    );
    expect(wrapper.find('tr').hostNodes()).toHaveLength(3); // one row for the header
  });

  it('should show rule names on the table', function() {
    const wrapper = mountWithIntl(
      <RulesComponent team={team} />
    );
    expect(wrapper.text()).toMatch('Rule 1');
    expect(wrapper.text()).toMatch('Rule 2');
  });
});
