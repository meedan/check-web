import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ErrorBoundary from '../error/ErrorBoundary';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ScheduleSendIcon from '../../icons/schedule_send.svg';
import DoneIcon from '../../icons/done.svg';
import { can } from '../Can';
import styles from './FeedInvitation.module.css';

const FeedInvitationComponent = ({ routeParams, ...props }) => {
  // display an error if the user is not an admin on any workspaces
  const noAdminWorkspaces = props.me.teams?.edges.filter(team => can(team.node.permissions, 'update Team')).length === 0;
  const oneAdminWorkspace = props.me.teams?.edges.filter(team => can(team.node.permissions, 'update Team')).length === 1;
  const alreadyAccepted = props.feed_invitation?.state === 'accepted';

  // redirect to the accept/decline page if the user only administers one workspace
  if (oneAdminWorkspace) {
    const team = props.me.teams.edges[0];
    browserHistory.push(`/${team.node.slug}/feed/${routeParams.feedId}/invitation`);
  }

  const teamDbids = props.feed_invitation.feed.feed_teams.edges.map(edge => edge.node.team.dbid);

  const handleClick = team => browserHistory.push(`/${team.node.slug}/feed/${routeParams.feedId}/invitation`);

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
            <FormattedMessage defaultMessage="has invited your organization to contribute to a Shared Feed" description="This is a fragment of text that appears after the name of a person and email address, like: '[[Bob Smith, bob@example.com]] has invited your organization to...'. The name appears above the text and this part of the sentence continues on the second row of text. The two messages combined should read like a grammatically correct sentence." id="feedInvitation.invited" />
          </div>
          <div>
            <span className={cx('typography-body1-bold')}>&ldquo;{props.feed_invitation.feed.name}&rdquo;</span>
          </div>
        </div>
        <div className={cx('typography-h6')}>
          <FormattedMessage defaultMessage="Which workspace will you use to contribute to this shared feed?" description="A question prompting the user to pick one of several workspaces from a list, reminding them that this will contribute data to a shared feed." id="feedInvitation.prompt" />
        </div>
        {alreadyAccepted && (
          <Alert
            className={cx(styles['no-admin-alert'])}
            contained
            title={<FormattedMessage defaultMessage="You have already accepted this invitation." description="An informational message that appears if the user tries to accept an invitation that they have already accepted." id="feedInvitation.alreadyAccepted" />}
            variant="info"
          />
        )}
        {noAdminWorkspaces && (
          <Alert
            className={cx(styles['no-admin-alert'])}
            contained
            title={<FormattedMessage defaultMessage="You are not an admin of any workspaces. Please contact your workspace administrator if you think this is in error." description="An error message that informs the user that they are not a workspace administrator and as such cannot perform any actions on this page." id="feedInvitation.noWorkspaces" />}
            variant="error"
          />
        )}
        { !noAdminWorkspaces && !alreadyAccepted && props.me.teams?.edges
          .filter(team => can(team.node.permissions, 'update Team'))
          .sort((a, b) => a.node.name.localeCompare(b.node.name))
          .map(team => (
            <div
              className={cx(styles.workspace)}
              onClick={() => handleClick(team)}
              onKeyDown={() => handleClick(team)}
            >
              <div className={cx(styles.avatar)}>
                <img alt={team.node.name} src={team.node.avatar} />
              </div>
              <span className="typography-body1">{team.node.name}</span>
              <ButtonMain
                className={`int-feed-invitation__button--workspace ${teamDbids.includes(team.node.dbid) ? styles['feed-invitation-accepted'] : ''}`}
                iconLeft={<DoneIcon />}
                label={
                  teamDbids.includes(team.node.dbid) ?
                    <FormattedMessage
                      defaultMessage="Invitation accepted"
                      description="Label for a button indicating the invitation has been accepted"
                      id="feedInvitation.acceptedButton"
                    /> :
                    <FormattedMessage
                      defaultMessage="View invitation"
                      description="Label for a button that the user presses to view an invitation that they are going to accept or reject"
                      id="feedInvitation.viewButton"
                    />
                }
                size="small"
                theme="validation"
                variant="text"
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
    feedId: PropTypes.string.isRequired,
  }).isRequired,
};

const FeedInvitation = ({ routeParams }) => (
  <ErrorBoundary component="Feed">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query FeedInvitationQuery($feedId: Int) {
          feed_invitation(feedId: $feedId) {
            state
            feed {
              name
              feed_teams(first: 100) {
                edges {
                  node {
                    team {
                      dbid
                    }
                  }
                }
              }
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
                  dbid
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
      render={({ error, props }) => {
        if (!error && props) {
          return <FeedInvitationComponent routeParams={routeParams} {...props} />;
        }
        return null;
      }}
      variables={{
        feedId: parseInt(routeParams.feedId, 10),
      }}
    />
  </ErrorBoundary>
);

FeedInvitation.propTypes = {
  routeParams: PropTypes.shape({
    feedId: PropTypes.string.isRequired,
  }).isRequired,
};

export default FeedInvitation;
