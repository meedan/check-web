import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import { withSetFlashMessage } from '../FlashMessage';

const FeedSharingSwitch = ({
  enabled,
  feedTeamId,
  readOnly,
  setFlashMessage,
}) => {
  const [saving, setSaving] = React.useState(false);

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="feedSharingSwitch.defaultErrorMessage"
        defaultMessage="Could not update your sharing settings for this feed, please try again"
        description="Error message displayed when it's not possible to change sharing setting for a feed."
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="feedSharingSwitch.savedSuccessfully"
        defaultMessage="Sharing settings for this feed were updated successfully"
        description="Success message displayed when data sharing is changed for a feed."
      />
    ), 'success');
  };

  const handleChange = (e) => {
    setSaving(true);

    const mutation = graphql`
      mutation FeedSharingSwitchUpdateFeedTeamMutation($input: UpdateFeedTeamInput!) {
        updateFeedTeam(input: $input) {
          feed_team {
            shared
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id: feedTeamId,
          shared: e.target.checked,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess();
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const SwitchWrapper = ({ children }) => {
    if (readOnly) {
      return (
        <Tooltip title={<FormattedMessage id="feedSharingSwitch.tooltip" defaultMessage="You need to save changes before sharing" description="Tooltip displayed on feed 'Enable sharing' switcher" />}>
          <span>
            {children}
          </span>
        </Tooltip>
      );
    }
    return children;
  };

  return (
    <Box mb={4} mt={2}>
      <Box display="flex" alignItems="center">
        <SwitchWrapper>
          <Switch
            checked={enabled}
            onChange={handleChange}
            disabled={saving || readOnly}
          />
        </SwitchWrapper>
        <strong>
          <FormattedMessage
            id="feedSharingSwitch.label"
            defaultMessage="Enable sharing"
            description="Label for a toggle/switcher displayed on feed page, under the Shared tab."
          />
        </strong>
      </Box>
      <Box ml={7}>
        <FormattedMessage
          id="feedSharingSwitch.description"
          defaultMessage="Select the content to share in this feed using the filter."
          description="Description for a toggle/switcher displayed on feed page, under the Shared tab."
        />
      </Box>
    </Box>
  );
};

FeedSharingSwitch.defaultProps = {
  readOnly: false,
};

FeedSharingSwitch.propTypes = {
  enabled: PropTypes.bool.isRequired,
  feedTeamId: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
};

export default withSetFlashMessage(FeedSharingSwitch);
