import React from 'react';
import { MediaActionsMenuButton } from './MediaActionsMenuButton';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import CheckArchivedFlags from '../../CheckArchivedFlags';

describe('<MediaActionsMenuButton />', () => {
  const props = {
    isParent: true,
    projectMedia: {
      id: 'bli',
      permissions: '{"update ProjectMedia":true}',
      archived: CheckArchivedFlags.NONE,
      last_status_obj: {
        locked: false,
      },
      media: {
        url: 'http://bli.blo',
      },
    },
    handleRefresh: () => {},
    handleSendToTrash: () => {},
    handleSendToSpam: () => {},
    handleAssign: () => {},
    handleStatusLock: () => {},
  };

  it('should allow sending Unconfirmed items to the Trash and to Spam', () => {
    const wrapper = mountWithIntl(<MediaActionsMenuButton {...props} />);
    wrapper.find('#media-actions-menu-button__icon-button').hostNodes().simulate('click');
    expect(wrapper.find('.media-actions').at(0).props().open).toEqual(true);
    expect(wrapper.find('.media-actions__history').hostNodes().length).toEqual(1);
    expect(wrapper.find('.media-actions__send-to-trash').hostNodes().length).toEqual(1);
    expect(wrapper.find('.media-actions__send-to-spam').hostNodes().length).toEqual(1);
  });
});
