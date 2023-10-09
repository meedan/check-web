import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Box from '@material-ui/core/Box';
import BulkActionsMenu from './BulkActionsMenu';
import Can from '../Can';
import { withSetFlashMessage } from '../FlashMessage';

class BulkActions extends React.Component {
  fail = () => {};

  render() {
    const {
      page, team,
    } = this.props;
    // const disabled = selectedMedia.length === 0;
    let actionsAvailable = null;
    const permissionKey = 'bulk_update ProjectMedia';

    actionsAvailable = (
      <BulkActionsMenu
        selectedMedia={this.props.selectedMedia}
        /*
            FIXME: The `selectedMedia` prop above contained IDs only, so I had to add the `selectedProjectMedia` prop
            below to contain the PM objects as the tagging mutation currently requires dbids and
            also for other requirements such as warning about published reports before bulk changing statuses
            additional data is needed.
            I suggest refactoring this later to nix the ID array and pass the ProjectMedia array only.
          */
        selectedProjectMedia={this.props.selectedProjectMedia}
        team={team}
        page={page}
        onUnselectAll={this.props.onUnselectAll}
        setFlashMessage={this.props.setFlashMessage}
      />
    );

    return (
      <span id="media-bulk-actions">
        <Box id="media-bulk-actions__actions" display="flex" alignItems="center">
          <React.Fragment>
            <Can permission={permissionKey} permissions={team.permissions}>
              {actionsAvailable}
            </Can>
          </React.Fragment>
        </Box>
      </span>
    );
  }
}

BulkActions.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.object.isRequired,
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash']).isRequired, // FIXME Define listing types as a global constant
  selectedMedia: PropTypes.array.isRequired,
  selectedProjectMedia: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  onUnselectAll: PropTypes.func.isRequired,
};

export default createFragmentContainer(withSetFlashMessage(BulkActions), graphql`
  fragment BulkActions_team on Team {
    permissions
  }
`);
