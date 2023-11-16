import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import ErrorBoundary from '../error/ErrorBoundary';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import Alert from '../cds/alerts-and-prompts/Alert';
import { FlashMessageSetterContext } from '../FlashMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import styles from './FeedInvitation.module.css';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ScheduleSendIcon from '../../icons/schedule_send.svg';
import NotFound from '../NotFound';
import MediasLoading from '../media/MediasLoading';
import { can } from '../Can';

const acceptMutation = graphql`
  mutation FeedInvitationRespondAcceptFeedInvitationMutation($input: UpdateFeedInvitationInput!) {
    acceptFeedInvitation(input: $input) {
      feed_invitation {
        id
      }
    }
  }
`;

const rejectMutation = graphql`
  mutation FeedInvitationRespondRejectFeedInvitationMutation($input: RejectInput!) {
    rejectFeedInvitation(input: $input) {
      success
    }
  }
`;

const FeedInvitationRespondComponent = ({ routeParams, ...props }) => {
  const [saving, setSaving] = React.useState(false);
  const [confirmReject, setConfirmReject] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  // `feed_invitation` is null when attempting to view a feed invitation that doesn't exist or that you don't have permission to view
  if (!props.feed_invitation) {
    return <NotFound />;
  }

  const feedInvitationId = props.feed_invitation.dbid;
  // determine if the current user is an admin of the current team
  const notAdmin = !can(props.me.current_team?.permissions, 'update Team');
  const alreadyAccepted = props.feed_invitation?.state === 'accepted';

  const onFailure = (error) => {
    const message = getErrorMessageForRelayModernProblem(error, <GenericUnknownErrorMessage />);
    setFlashMessage(message, 'error');
    setSaving(false);
  };

  const handleAcceptInvite = () => {
    setSaving(true);
    const input = {
      id: feedInvitationId,
      team_id: props.me.current_team?.dbid,
    };
    commitMutation(Relay.Store, {
      mutation: acceptMutation,
      variables: { input },
      onCompleted: () => browserHistory.push(`/${props.me.current_team?.slug}/feed/${props.feed_invitation?.feed.dbid}/edit`),
      onError: onFailure,
    });
  };

  const handleRejectInvite = () => {
    setConfirmReject(false);
    setSaving(true);
    const input = {
      id: feedInvitationId,
    };
    commitMutation(Relay.Store, {
      mutation: rejectMutation,
      variables: { input },
      onCompleted: () => browserHistory.push(`/${props.me.current_team?.slug}/all-items`),
      onError: onFailure,
    });
  };

  return (
    <div className={cx('feed-invitation-container', styles['feed-invitation-container'])}>
      <div className={cx('feed-invitation-container-card', styles['feed-invitation-container-card'])}>
        <div className={styles['header-icon']}>
          <ScheduleSendIcon />
        </div>
        <div>
          <div className={cx('typography-h6')}>
            {props.feed_invitation.user.name}, <span className={styles.email}>{props.feed_invitation.user.email}</span>
          </div>
          <div className={cx('typography-body1', styles.invited)}>
            <FormattedMessage id="feedInvitation.invited" defaultMessage="has invited your organization to contribute to a Check Shared Feed" description="This is a fragment of text that appears after the name of a person and email address, like: '[[Bob Smith, bob@example.com]] has invited your organization to...'. The name appears above the text and this part of the sentence continues on the second row of text. The two messages combined should read like a grammatically correct sentence." />
          </div>
          <div>
            <span className={cx('typography-body1-bold')}>&ldquo;{props.feed_invitation.feed.name}&rdquo;</span>
          </div>
        </div>
        <div className={cx('typography-body2', styles.description)}>
          {props.feed_invitation.feed.description}
        </div>
        { notAdmin && (
          <Alert
            className={cx(styles['no-admin-alert'])}
            contained
            content={<FormattedMessage id="feedInvitation.notAdmin" defaultMessage="You are not the admin of this workspace. Please contact your workspace administrator if you think this is in error." description="An error message that informs the user that they are not the administrator of this workspace and as such cannot perform any actions on this page." />}
            variant="error"
          />
        )}
        {alreadyAccepted && (
          <Alert
            className={cx(styles['no-admin-alert'])}
            contained
            content={<FormattedMessage id="feedInvitation.alreadyAccepted" defaultMessage="You have already accepted this invitation." description="An informational message that appears if the user tries to accept an invitation that they have already accepted." />}
            variant="info"
          />
        )}
        { !notAdmin && !alreadyAccepted && (
          <div className={cx(styles['accept-decline'])}>
            <div className={cx(styles['action-container'])}>
              <ButtonMain
                className="int-feed-invitation-respond__button--accept"
                label={<FormattedMessage id="feedInvitation.accept" defaultMessage="Accept Invitation" description="Label for a button that the user presses to accept an invitation they have received to collaborate with another organization" />}
                variant="contained"
                theme="brand"
                onClick={handleAcceptInvite}
                disabled={saving}
              />
              { saving && <MediasLoading theme="grey" variant="icon" size="icon" /> }
            </div>
            <div className={cx(styles['action-container'])}>
              { saving && <MediasLoading theme="grey" variant="icon" size="icon" /> }
              <ButtonMain
                className="int-feed-invitation-respond__button--reject"
                label={<FormattedMessage id="feedInvitation.decline" defaultMessage="Decline Invitation" description="Label for a button that the user presses to decline an invitation they have received to collaborate with another organization" />}
                variant="outlined"
                theme="text"
                disabled={saving}
                onClick={() => { setConfirmReject(true); }}
              />
            </div>
          </div>
        )}
      </div>
      <ConfirmProceedDialog
        open={confirmReject}
        title={
          <FormattedMessage
            id="feedItem.importTitle"
            defaultMessage="Import data to workspace"
            description="Dialog title when importing a claim from feed page."
          />
        }
        body={(
          <>
            <span className="typography-title">
              <FormattedMessage
                id="feedItem.importDescription"
                defaultMessage="A new claim will be created in your workspace with media."
                description="Dialog description when importing a claim from feed page."
              />
            </span>
          </>
        )}
        // proceedDisabled={!selectedImportingTeam || (!importingClaimDescription && !importingClaim?.description)}
        proceedLabel={<FormattedMessage id="feedItem.proceedImport" defaultMessage="Import" description="Button label to confirm importing claim from feed page" />}
        onProceed={handleRejectInvite}
        onCancel={() => { setConfirmReject(false); }}
        isSaving={saving}
      />
    </div>
  );
};

FeedInvitationRespondComponent.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    feedId: PropTypes.string.isRequired,
  }).isRequired,
};

const FeedInvitationRespond = ({ routeParams }) => (
  <ErrorBoundary component="Feed">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedInvitationRespondQuery($feedId: Int) {
          feed_invitation(feedId: $feedId) {
            state
            dbid
            feed {
              dbid
              name
              description
            }
            user {
              name
              email
            }
          }
          me {
            current_team {
              dbid
              slug
              permissions
            }
          }
        }
      `}
      variables={{
        feedId: parseInt(routeParams.feedId, 10),
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return <FeedInvitationRespondComponent routeParams={routeParams} {...props} />;
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

FeedInvitationRespond.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    feedId: PropTypes.string.isRequired,
  }).isRequired,
};

export default FeedInvitationRespond;
