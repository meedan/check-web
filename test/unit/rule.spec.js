import React from 'react';
import { IntlProvider } from 'react-intl';
import { mountWithIntl } from './helpers/intl-test';
import Rule from './../../src/app/components/team/Rules/Rule';
import schema from './mocks/rules-schema';
import rules from './mocks/rules';

const props = {
  rules,
  schema,
  onSetCurrentRuleIndex: () => {},
  onUpdateRules: () => {},
};

describe('<Rule />', () => {
  it('should render fields for one rule', function() {
    const wrapper = mountWithIntl(
      <Rule {...props} index={0} />
    );
    expect(wrapper.find('input').hostNodes()).toHaveLength(9);
    expect(wrapper.find('input[value="Rule 1"]').hostNodes()).toHaveLength(1);
  });

  it('should render fields for another rule', function() {
    const wrapper = mountWithIntl(
      <Rule {...props} index={1} />
    );
    expect(wrapper.find('input').hostNodes()).toHaveLength(8);
    expect(wrapper.find('input[value="Rule 2"]').hostNodes()).toHaveLength(1);
  });
});
