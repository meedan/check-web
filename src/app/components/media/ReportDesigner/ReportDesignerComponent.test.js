import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import ReportDesignerComponent from './ReportDesignerComponent';
import ReportDesignerTopBar from './ReportDesignerTopBar';
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
                backgroundColor: '#518FFF',
                color: '#518FFF',
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
