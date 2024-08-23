import React from 'react';
import MediaStatus from './MediaStatus';
import { MediaActionsBarComponent } from './MediaActionsBar';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
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
            backgroundColor: 'var(--color-blue-54)',
            color: 'var(--color-blue-54)',
          },
        },
      ],
    },
    team_users: {
      edges: [],
    },
  };

  const team2 = {
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
    const wrapper = shallowWithIntl(<MediaActionsBarComponent classes={classes} media={media} setFlashMessage={() => {}} />);
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
    const wrapper = shallowWithIntl(<MediaActionsBarComponent classes={classes} media={media} setFlashMessage={() => {}} />);
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
    const wrapper = shallowWithIntl(<MediaActionsBarComponent classes={classes} media={media} setFlashMessage={() => {}} />);
    expect(wrapper.find(MediaStatus)).toHaveLength(1);
    expect(wrapper.find(MediaStatus).props().readonly).toEqual(true);
  });

  it('should render without errors even if do not have team users', () => {
    const media = {
      team: { team2 },
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
    const wrapper = shallowWithIntl(<MediaActionsBarComponent classes={classes} media={media} setFlashMessage={() => {}} />);
    expect(wrapper.find('.project__assignment-menu')).toHaveLength(1);
  });

  it('should render without errors even if media do not have assignments', () => {
    const media = {
      team: { team2 },
      archived: CheckArchivedFlags.UNCONFIRMED,
      last_status_obj: {
        locked: false,
      },
      dynamic_annotation_report_design: {
        data: {
          state: 'not-published', // As opposed to 'published' for this matter. Not necessarily an actual possible value.
        },
      },
    };
    const wrapper = shallowWithIntl(<MediaActionsBarComponent classes={classes} media={media} setFlashMessage={() => {}} />);
    expect(wrapper.find('.project__assignment-menu')).toHaveLength(1);
  });
});
