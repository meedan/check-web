import React from 'react';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import MediaStatus from './MediaStatus';
import { MediaActionsBarComponent } from './MediaActionsBar';
import CheckArchivedFlags from '../../CheckArchivedFlags';

describe('<MediaActionsBarComponent />', () => {
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
            backgroundColor: '#518FFF',
            color: '#518FFF',
          },
        },
      ],
    },
    team_users: {
      edges: [],
    },
  };

  const classes = {};

  it('should allow status change for Unconfirmed items', () => {
    const media = {
      team,
      archived: CheckArchivedFlags.UNCONFIRMED,
      last_status_obj: {
        locked: false,
        assignments: {
          edges: [],
        },
      },
      dynamic_annotation_report_design: {
        data: {
          state: 'not-published', // As opposed to 'published' for this matter. Not necessarily an actual possible value.
        },
      },
    };
    const wrapper = shallowWithIntl(<MediaActionsBarComponent media={media} classes={classes} setFlashMessage={() => {}} />);
    expect(wrapper.find(MediaStatus)).toHaveLength(1);
    expect(wrapper.find(MediaStatus).props().readonly).toEqual(false);
  });

  it('should NOT allow status change for Trashed items', () => {
    const media = {
      team,
      archived: CheckArchivedFlags.TRASHED,
      last_status_obj: {
        locked: false,
        assignments: {
          edges: [],
        },
      },
      dynamic_annotation_report_design: {
        data: {
          state: 'not-published', // As opposed to 'published' for this matter. Not necessarily an actual possible value.
        },
      },
    };
    const wrapper = shallowWithIntl(<MediaActionsBarComponent media={media} classes={classes} setFlashMessage={() => {}} />);
    expect(wrapper.find(MediaStatus)).toHaveLength(1);
    expect(wrapper.find(MediaStatus).props().readonly).toEqual(true);
  });

  it('should NOT allow status change for published items', () => {
    const media = {
      team,
      archived: CheckArchivedFlags.NONE,
      last_status_obj: {
        locked: false,
        assignments: {
          edges: [],
        },
      },
      dynamic_annotation_report_design: {
        data: {
          state: 'published',
        },
      },
    };
    const wrapper = shallowWithIntl(<MediaActionsBarComponent media={media} classes={classes} setFlashMessage={() => {}} />);
    expect(wrapper.find(MediaStatus)).toHaveLength(1);
    expect(wrapper.find(MediaStatus).props().readonly).toEqual(true);
  });
});
