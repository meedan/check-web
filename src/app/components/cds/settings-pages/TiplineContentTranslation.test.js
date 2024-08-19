import React from 'react';
import TiplineContentTranslation from './TiplineContentTranslation';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<TiplineContentTranslation />', () => {
  it('should render TiplineContentTranslation component', () => {
    const wrapper = mountWithIntl(<TiplineContentTranslation
      identifier="test"
      title={<span>Foo</span>}
      description={<span>Bar</span>}
      defaultValue="Test"
      onUpdate={() => {}}
    />);
    expect(wrapper.find('textarea').hostNodes()).toHaveLength(2);
  });
});
