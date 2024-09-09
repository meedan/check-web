import React from 'react';
import TiplineContentTranslation from './TiplineContentTranslation';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<TiplineContentTranslation />', () => {
  it('should render TiplineContentTranslation component', () => {
    const wrapper = mountWithIntl(<TiplineContentTranslation
      defaultValue="Test"
      description={<span>Bar</span>}
      identifier="test"
      title={<span>Foo</span>}
      onUpdate={() => {}}
    />);
    expect(wrapper.find('textarea').hostNodes()).toHaveLength(1);
  });
});
