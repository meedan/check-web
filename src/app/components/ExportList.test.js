import React from 'react';
import ExportList from './ExportList';
import { shallowWithIntl } from '../../../test/unit/helpers/intl-test';

describe('<ExportList />', () => {
  it('should render export list component', () => {
    global.window = Object.create(window);
    Object.defineProperty(window, 'Check', {
      value: {
        store: {
          getState: () => ({ app: { context: { currentUser: { email: 'foo@bar.xyz' } } } }),
        },
      },
    });

    const wrapper = shallowWithIntl(<ExportList type="media" />);
    expect(wrapper.find('Tooltip')).toHaveLength(1);
  });
});
