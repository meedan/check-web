import React from 'react';
import { IntlProvider } from 'react-intl';
import { mountWithIntl } from './helpers/intl-test';
import Rule from './../../src/app/components/team/Rules/Rule';
import schema from './mocks/rules-schema';
import rules from './mocks/rules';

const props = {
  schema,
  unsavedChanges: false,
  onGoBack: () => {},
  onDeleteRule: () => {},
  onDuplicateRule: () => {},
  onSaveRule: () => {},
  onChangeRule: () => {},
};

describe('<Rule />', () => {
  it('should render fields for one rule', function() {
    const wrapper = mountWithIntl(
      <Rule {...props} rule={rules[0]} />
    );
    expect(wrapper.find('input').hostNodes()).toHaveLength(9);
  });

  it('should render fields for another rule', function() {
    const wrapper = mountWithIntl(
      <Rule {...props} rule={rules[1]} />
    );
    expect(wrapper.find('input').hostNodes()).toHaveLength(8);
  });
});
