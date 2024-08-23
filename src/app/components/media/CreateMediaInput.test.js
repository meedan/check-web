import React from 'react';
import CreateMediaInput from './CreateMediaInput';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import UploadFile from '../UploadFile';

describe('<CreateMediaInput />', () => {
  const team = {
    slug: 'test',
    verification_statuses: {
      label: 'Status',
      default: 'undetermined',
      active: 'in_progress',
      statuses: [
        {
          description: 'Default, just added, no work has started',
          id: 'undetermined',
          label: 'Unstarted',
          style: {
            backgroundColor: 'var(--color-blue-54)',
            color: 'var(--color-blue-54)',
          },
        },
      ],
    },
  };

  it('should render input fields', () => {
    const wrapper = mountWithIntlProvider(<CreateMediaInput team={team} />);
    expect(wrapper.find('#create-media-input').hostNodes()).toHaveLength(1);
    expect(wrapper.find(UploadFile)).toHaveLength(1);
  });
});
