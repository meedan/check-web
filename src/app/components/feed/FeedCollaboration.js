/* eslint-disable relay/unused-fields */
// FIXME / TODO this relay/unused-fields bypass is simply because TeamAvatar uses team.avatar internally
// Perhaps a better approach is to have TeamAvatar receive team.avatar value directly as prop
import React from 'react';
import PropTypes from 'prop-types';
import { graphql, commitMutation, createFragmentContainer } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import cx from 'classnames/bind';
import * as EmailValidator from 'email-validator';
import styles from './FeedCollaboration.module.css';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import AddIcon from '../../icons/add.svg';
import ClearIcon from '../../icons/clear.svg';
import PersonAddIcon from '../../icons/person_add.svg';
import ScheduleSendIcon from '../../icons/schedule_send.svg';
import TeamAvatar from '../team/TeamAvatar';
import ExternalLink from '../ExternalLink';

const messages = defineMessages({
  placeholder: {
    id: 'feedCollaboration.placeholder',
    defaultMessage: 'Add collaborator email address',
    description: 'Placeholder of the input field for invited organizations',
  },
});

const destroyInviteMutation = graphql`
  mutation FeedCollaborationDestroyFeedInvitationMutation($input: DestroyFeedInvitationInput!) {
    destroyFeedInvitation(input: $input) {
      deletedId
      feed {
        feed_invitations(first: 100) {
          edges {
            node {
              id
              email
            }
          }
        }
      }
    }
  }
`;

const removeTeamMutation = graphql`
  mutation FeedCollaborationDestroyFeedTeamMutation($input: DestroyFeedTeamInput!) {
    destroyFeedTeam(input: $input) {
      deletedId
      feed {
        feed_teams(first: 100) {
          edges {
            node {
              id
              team {
                name
              }
            }
          }
        }
      }
    }
  }
`;

const FeedCollaboration = ({
  collaboratorId,
  feed,
  intl,
  onChange,
}) => {
  const [textValue, setTextValue] = React.useState(null);
  const [invites, setInvites] = React.useState([]);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const readOnly = Boolean(collaboratorId);

  const handleAdd = (email) => {
    if (EmailValidator.validate(email)) {
      const newInvites = [...invites];
      newInvites.push(email);
      setTextValue('');
      setInvites(newInvites);
      onChange(newInvites);
    }
  };

  const onFailure = (error) => {
    const message = getErrorMessageForRelayModernProblem(error, <GenericUnknownErrorMessage />);
    setFlashMessage(message, 'error');
  };

  const handleDelete = (email) => {
    const newInvites = [...invites];
    newInvites.splice(newInvites.indexOf(email), 1);
    setInvites(newInvites);
    onChange(newInvites);
  };

  const handleSubmitDeleteInvite = (id) => {
    commitMutation(Relay.Store, {
      mutation: destroyInviteMutation,
      variables: { input: { id } },
      onError: onFailure,
    });
  };

  const handleSubmitRemoveTeam = (id) => {
    commitMutation(Relay.Store, {
      mutation: removeTeamMutation,
      variables: { input: { id } },
      onError: onFailure,
    });
  };

  const FeedCollabRow = ({
    className,
    label,
    team,
    type,
    onRemove,
  }) => (
    <div className={cx(styles['feed-collab-row'], className)}>
      { !team &&
        <div
          className={cx(
            styles['feed-collab-icon'],
            {
              [styles.invitationSentIcon]: type === 'invitation-sent',
              [styles.invitationNewIcon]: type === 'invitation-new',
            })
          }
        >
          { type === 'invitation-new' && <PersonAddIcon /> }
          { type === 'invitation-sent' && <ScheduleSendIcon /> }
        </div>
      }
      { team &&
        <TeamAvatar team={team} />
      }
      <div
        className={cx(
          styles['feed-collab-label'],
          {
            [styles.invitationSentLabel]: type === 'invitation-sent',
          })
        }
      >
        { type === 'invitation-sent' &&
          <span className="typography-body1">
            <FormattedMessage id="feedCollaboration.pending" defaultMessage="Invitation sent - pending" description="The status of a sent invitation to join a shared feed - pending acceptance" />
            <br />
          </span>
        }
        <span className={type === 'invitation-sent' ? 'typography-body2' : 'typography-body1'}>
          {label}
        </span>
      </div>
      { type === 'organizer' ?
        <span className={cx('typography-body2', styles['feed-collab-organizer'])}>
          <FormattedMessage id="feedCollaboration.organizer" defaultMessage="organizer" description="Label to highlight the Shared Feed organizer" />
        </span> : null
      }
      { collaboratorId === team?.dbid ?
        <span className={cx('typography-body2', styles['feed-collab-organizer'])}>
          <FormattedMessage id="feedCollaboration.you" defaultMessage="you" description="Label to highlight user's organization in Shared Feed collaboration widget" />
        </span> : null
      }
      { type !== 'organizer' && !readOnly ?
        <Tooltip arrow title={<FormattedMessage id="feedCollaboration.remove" defaultMessage="Remove" description="Tooltip for button to remove invitation or feed collaborator" />}>
          <span>
            <ButtonMain
              className="int-feed-collab-row__remove-button"
              onClick={onRemove}
              iconCenter={<ClearIcon />}
              variant="contained"
              size="small"
              theme="lightText"
            />
          </span>
        </Tooltip> : null
      }
    </div>
  );

  return (
    <div className={styles['feed-collab-card']}>
      <span className="typography-subtitle2">
        { readOnly ?
          <FormattedMessage
            id="feedCollaboration.titleCollaborator"
            defaultMessage="Collaborating Organizations [{count}]"
            description="Title of the collaboration box in which feed organizer invites other organizations to a shared feed"
            values={{ count: feed.feed_teams?.edges.length + feed.feed_invitations?.edges.length }}
          /> :
          <FormattedMessage
            id="feedCollaboration.title"
            defaultMessage="Collaboration"
            description="Title of the collaboration box in which feed organizer invites other organizations to a shared feed"
          />
        }
      </span>
      { !feed.dbid &&
        <span className="typography-body2">
          <FormattedMessage
            id="feedCollaboration.description"
            defaultMessage="Invite other organizations to contribute data into this shared feed. All contributing organizations to this feed share the same data point."
            description="Description to the feed collaboration management feature"
          />
          &nbsp;
          <ExternalLink url="https://help.checkmedia.org/en/articles/8542417-invitation-shared-feed">
            <FormattedMessage
              id="feedCollaboration.learnMore"
              defaultMessage="Learn more"
              description="Link to knowledge base article on shared feed invitations"
            />
          </ExternalLink>
        </span>
      }
      { !readOnly && (
        <div className={styles['feed-collab-input']}>
          <TextField
            className={cx(styles['feed-collab-text-field'], 'int-feed-collab__text-field')}
            value={textValue}
            placeholder={intl.formatMessage(messages.placeholder)}
            onChange={e => setTextValue(e.target.value)}
          />
          <ButtonMain
            className="int-feed-collab__add-button"
            onClick={() => handleAdd(textValue)}
            iconCenter={<AddIcon />}
            variant="contained"
            size="default"
            theme="brand"
            disabled={!EmailValidator.validate(textValue)}
          />
        </div>
      )}
      <div className={styles['feed-collab-invites']}>
        { feed.feed_teams?.edges.map(ft => (
          <FeedCollabRow
            key={ft.node.team.name}
            className="feed-collab-row__member"
            label={ft.node.team.name}
            team={ft.node.team}
            type={ft.node.team.dbid === feed.team.dbid ? 'organizer' : 'collaborator'}
            onRemove={() => handleSubmitRemoveTeam(ft.node.id)}
          />
        ))}
        { feed.feed_invitations?.edges.map(fi => (
          <FeedCollabRow
            key={fi.node.email}
            className="feed-collab-row__invitation-sent"
            label={fi.node.email}
            onRemove={() => handleSubmitDeleteInvite(fi.node.id)}
            type="invitation-sent"
          />
        ))}
        { invites.map(email => (
          <FeedCollabRow
            key={email}
            className="feed-collab-row__invitation-new"
            label={email}
            onRemove={() => handleDelete(email)}
            type="invitation-new"
          />
        ))}
      </div>
    </div>
  );
};

FeedCollaboration.defaultProps = {
  collaboratorId: null,
};

FeedCollaboration.propTypes = {
  collaboratorId: PropTypes.number,
  feed: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  onChange: PropTypes.func.isRequired,
};

export { FeedCollaboration }; // eslint-disable-line import/no-unused-modules

export default createFragmentContainer(injectIntl(FeedCollaboration), graphql`
  fragment FeedCollaboration_feed on Feed {
    dbid
    feed_teams(first: 100) {
      edges {
        node {
          id
          team {
            dbid
            avatar
            name
          }
        }
      }
    }
    feed_invitations(first: 100) {
      edges {
        node {
          id
          email
        }
      }
    }
    team {
      dbid
    }
  }
`);
