import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ErrorBoundary from '../error/ErrorBoundary';
import Alert from '../cds/alerts-and-prompts/Alert';
import styles from './FeedInvitation.module.css';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ScheduleSendIcon from '../../icons/schedule_send.svg';
import DoneIcon from '../../icons/done.svg';
import NotFound from '../NotFound';
import { can } from '../Can';

const FeedInvitationComponent = ({ routeParams, ...props }) => {
  // `feed_invitation` is null when attempting to view a feed invitation that doesn't exist or that you don't have permission to view
  if (!props.feed_invitation) {
    return <NotFound />;
  }

  const feedInvitationId = parseInt(routeParams.feedInvitationId, 10);
  // display an error if the user is not an admin on any workspaces
  const noAdminWorkspaces = props.me.teams?.edges.filter(team => can(team.node.permissions, 'update Team')).length === 0;
  const oneAdminWorkspace = props.me.teams?.edges.filter(team => can(team.node.permissions, 'update Team')).length === 1;
  const alreadyAccepted = props.feed_invitation?.state === 'accepted';

  // redirect to the accept/decline page if the user only administers one workspace
  if (oneAdminWorkspace) {
    const team = props.me.teams.edges[0];
    browserHistory.push(`/${team.node.slug}/feed-invitation/${feedInvitationId}/respond`);
  }

  const handleClick = team => browserHistory.push(`/${team.node.slug}/feed-invitation/${feedInvitationId}/respond`);

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
        <div className={cx('typography-h6')}>
          <FormattedMessage id="feedInvitation.prompt" defaultMessage="Which workspace will you use to contribute fact-checks to this shared feed?" description="A question prompting the user to pick one of several workspaces from a list, reminding them that this will contribute data to a shared feed." />
        </div>
        {alreadyAccepted && (
          <Alert
            className={cx(styles['no-admin-alert'])}
            contained
            content={<FormattedMessage id="feedInvitation.alreadyAccepted" defaultMessage="You have already accepted this invitation." description="An informational message that appears if the user tries to accept an invitation that they have already accepted." />}
            variant="info"
          />
        )}
        {noAdminWorkspaces && (
          <Alert
            className={cx(styles['no-admin-alert'])}
            contained
            content={<FormattedMessage id="feedInvitation.noWorkspaces" defaultMessage="You are not an admin of any workspaces. Please contact your workspace administrator if you think this is in error." description="An error message that informs the user that they are not a workspace administrator and as such cannot perform any actions on this page." />}
            variant="error"
          />
        )}
        { !noAdminWorkspaces && !alreadyAccepted && props.me.teams?.edges
          .filter(team => can(team.node.permissions, 'update Team'))
          .sort((a, b) => a.node.name.localeCompare(b.node.name))
          .map(team => (
            <div
              className={cx(styles.workspace)}
              onKeyDown={() => handleClick(team)}
              onClick={() => handleClick(team)}
            >
              <div className={cx(styles.avatar)}>
                <img src={team.node.avatar} alt={team.node.name} />
              </div>
              <span className="typography-body1">{team.node.name}</span>
              <ButtonMain
                className="int-feed-invitation__button--workspace"
                label={<FormattedMessage id="feedInvitation.viewButton" defaultMessage="View invitation" description="Label for a button that the user presses to view an invitation that they are going to accept or reject" />}
                iconLeft={<DoneIcon />}
                variant="text"
                size="small"
                theme="validation"
              />
            </div>
          ))
        }
      </div>
    </div>
  );
};

FeedInvitationComponent.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    feedInvitationId: PropTypes.string.isRequired,
  }).isRequired,
};

const FeedInvitation = ({ routeParams }) => (
  <ErrorBoundary component="Feed">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedInvitationQuery($feedInvitationId: ID!) {
          feed_invitation(id: $feedInvitationId) {
            state
            feed {
              name
            }
            user {
              name
              email
            }
          }
          me {
            teams(first: 1000) {
              edges {
                node {
                  name
                  avatar
                  slug
                  permissions
                }
              }
            }
          }
        }
      `}
      variables={{
        feedInvitationId: parseInt(routeParams.feedInvitationId, 10),
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return <FeedInvitationComponent routeParams={routeParams} {...props} />;
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

FeedInvitation.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    feedInvitationId: PropTypes.string.isRequired,
  }).isRequired,
};

export default FeedInvitation;
