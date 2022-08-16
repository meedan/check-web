import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import { withSetFlashMessage } from '../FlashMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';

const FeedSharingSwitch = ({
  enabled,
  feedTeamId,
  readOnly,
  numberOfWorkspaces,
  feedName,
  setFlashMessage,
}) => {
  const [saving, setSaving] = React.useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="feedSharingSwitch.defaultErrorMessage"
        defaultMessage="Could not update your sharing settings for this feed, please try again"
        description="Error message displayed when it's not possible to change sharing setting for a feed."
      />
    ), 'error');
    setShowConfirmationDialog(false);
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="feedSharingSwitch.savedSuccessfully"
        defaultMessage="Content shared to {feedName}"
        values={{ feedName }}
        description="Success message displayed when data sharing is changed for a feed."
      />
    ), 'success');
    setShowConfirmationDialog(false);
  };

  const handleChange = () => {
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
          shared: !enabled,
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
        <Tooltip title={<FormattedMessage id="feedSharingSwitch.tooltip" defaultMessage="Apply and save the filter to share" description="Tooltip displayed on feed 'Enable sharing' switcher" />}>
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
            onChange={() => { setShowConfirmationDialog(true); }}
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

      <ConfirmProceedDialog
        open={showConfirmationDialog}
        title={
          enabled ?
            <FormattedMessage id="feedSharingSwitch.confirmDisableSharingTitle" defaultMessage="Disable Shared Feed" description="Title of 'Disable feed sharing' confirmation window." /> :
            <FormattedMessage id="feedSharingSwitch.confirmEnableSharingTitle" defaultMessage="Enable Shared Feed" description="Title of 'Enable feed sharing' confirmation window." />
        }
        body={
          <Box>
            { enabled ?
              <FormattedMessage
                id="feedSharingSwitch.confirmDisableSharingContent"
                defaultMessage="Are you sure? {numberOfWorkspaces} other workspaces will immediately loose access to this content."
                values={{ numberOfWorkspaces: numberOfWorkspaces - 1 }}
                description="Content of 'Disable feed sharing' confirmation window."
              /> :
              <FormattedMessage
                id="feedSharingSwitch.confirmEnableSharingContent"
                defaultMessage="Are you sure? Any current and future content matching this filter will immediately be shared with {numberOfWorkspaces} other workspaces."
                values={{ numberOfWorkspaces: numberOfWorkspaces - 1 }}
                description="Content of 'Enable feed sharing' confirmation window."
              />
            }
          </Box>
        }
        proceedLabel={
          enabled ?
            <FormattedMessage id="feedSharingSwitch.disableSharing" defaultMessage="Disable sharing" description="Button label displayed on 'Disable feed sharing' confirmation window." /> :
            <FormattedMessage id="feedSharingSwitch.enableSharing" defaultMessage="Enable sharing" description="Button label displayed on 'Enable feed sharing' confirmation window." />
        }
        onProceed={handleChange}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="feedSharingSwitch.cancel" defaultMessage="Cancel" description="Button label displayed on 'Enable feed sharing' confirmation window." />}
        onCancel={() => { setShowConfirmationDialog(false); }}
      />
    </Box>
  );
};

FeedSharingSwitch.defaultProps = {
  readOnly: false,
};

FeedSharingSwitch.propTypes = {
  enabled: PropTypes.bool.isRequired,
  feedTeamId: PropTypes.string.isRequired,
  feedName: PropTypes.string.isRequired,
  numberOfWorkspaces: PropTypes.number.isRequired, // How many workspaces are part of this feed
  readOnly: PropTypes.bool,
};

export default withSetFlashMessage(FeedSharingSwitch);
