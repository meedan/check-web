import React from 'react';
import ReportDesignerComponent from './ReportDesignerComponent';
import ReportDesignerTopBar from './ReportDesignerTopBar';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import CheckArchivedFlags from '../../../CheckArchivedFlags';

describe('<ReportDesignerComponent />', () => {
  const props = {
    media: {
      permissions: '{"update ProjectMedia":true}',
      archived: CheckArchivedFlags.UNCONFIRMED,
      last_status: 'undetermined',
      team: {
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
              locales: {
                en: {
                  label: 'Unstarted',
                },
              },
            },
          ],
        },
      },
    },
    routeParams: {
      projectId: '1',
    },
    location: {
      query: {
        listPath: '',
      },
    },
    setFlashMessage: () => {},
  };

  it('should allow status change for Unconfirmed items', () => {
    const wrapper = mountWithIntl(<ReportDesignerComponent {...props} />);
    expect(wrapper.find(ReportDesignerTopBar)).toHaveLength(1);
    expect(wrapper.find(ReportDesignerTopBar).props().readOnly).toEqual(false);
  });
});
