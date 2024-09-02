import React from 'react';
import ExportList from './ExportList';
import { shallowWithIntl } from '../../../test/unit/helpers/intl-test';

describe('<ExportList />', () => {
  it('should render export list component', () => {
    const wrapper = shallowWithIntl(<ExportList type="media" />);
    expect(wrapper.find('Tooltip')).toHaveLength(1);
  });
});
