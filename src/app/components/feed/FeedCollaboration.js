/* eslint-disable relay/unused-fields, react/sort-prop-types */
// FIXME / TODO this relay/unused-fields bypass is simply because TeamAvatar uses team.avatar internally
// Perhaps a better approach is to have TeamAvatar receive team.avatar value directly as prop
import React from 'react';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import cx from 'classnames/bind';
import * as EmailValidator from 'email-validator';
import Alert from '../cds/alerts-and-prompts/Alert';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import AddIcon from '../../icons/add.svg';
import ClearIcon from '../../icons/clear.svg';
import PersonAddIcon from '../../icons/person_add.svg';
import ScheduleSendIcon from '../../icons/schedule_send.svg';
import TeamAvatar from '../team/TeamAvatar';
import ExternalLink from '../ExternalLink';
import styles from './FeedCollaboration.module.css';

const messages = defineMessages({
  placeholder: {
    id: 'feedCollaboration.placeholder',
    defaultMessage: 'Add collaborator email address',
    description: 'Placeholder of the input field for invited organizations',
  },
});

const FeedCollaboration = ({
  collaboratorId,
  feed,
  intl,
  onChange,
  onChangeCollaboratorsToRemove,
  onChangeInvitesToDelete,
  permissions,
  readOnly,
}) => {
  const [textValue, setTextValue] = React.useState('');
  const [invites, setInvites] = React.useState([]);
  const [invitesToDelete, setInvitesToDelete] = React.useState([]);
  const [collaboratorsToRemove, setCollaboratorsToRemove] = React.useState([]);

  const handleAdd = (email) => {
    if (EmailValidator.validate(email)) {
      const newInvites = [...invites];
      newInvites.push(email);
      setTextValue('');
      setInvites(newInvites);
      onChange(newInvites);
    }
  };

  const handleDelete = (email) => {
    const newInvites = [...invites];
    newInvites.splice(newInvites.indexOf(email), 1);
    setInvites(newInvites);
    onChange(newInvites);
  };

  const handleSelectInvitesToDelete = (obj) => {
    const newInvitesToDelete = [...invitesToDelete];
    newInvitesToDelete.push(obj);
    setInvitesToDelete(newInvitesToDelete);
    onChangeInvitesToDelete(newInvitesToDelete);
  };

  const handleSelectCollaboratorsToRemove = (obj) => {
    const newCollaboratorsToRemove = [...collaboratorsToRemove];
    newCollaboratorsToRemove.push(obj);
    setCollaboratorsToRemove(newCollaboratorsToRemove);
    onChangeCollaboratorsToRemove(newCollaboratorsToRemove);
  };

  const FeedCollabRow = ({
    className,
    label,
    onRemove,
    team,
    type,
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
            <FormattedMessage defaultMessage="Invitation sent - pending" description="The status of a sent invitation to join a shared feed - pending acceptance" id="feedCollaboration.pending" />
            <br />
          </span>
        }
        <span className={type === 'invitation-sent' ? 'typography-body2' : 'typography-body1'}>
          {label}
        </span>
      </div>
      { type === 'organizer' ?
        <span className={cx('typography-body2', styles['feed-collab-organizer'])}>
          <FormattedMessage defaultMessage="organizer" description="Label to highlight the Shared Feed organizer" id="feedCollaboration.organizer" />
        </span> : null
      }
      { type !== 'organizer' && collaboratorId === team?.dbid ?
        <span className={cx('typography-body2', styles['feed-collab-organizer'])}>
          <FormattedMessage defaultMessage="you" description="Label to highlight user's organization in Shared Feed collaboration widget" id="feedCollaboration.you" />
        </span> : null
      }
      { type !== 'organizer' && !readOnly && ((team && permissions['destroy FeedTeam']) || (!team && permissions['destroy FeedInvitation'])) ?
        <Tooltip arrow title={<FormattedMessage defaultMessage="Remove" description="Tooltip for button to remove invitation or feed collaborator" id="feedCollaboration.remove" />}>
          <span>
            <ButtonMain
              className="int-feed-collab-row__remove-button"
              iconCenter={<ClearIcon />}
              size="small"
              theme="lightText"
              variant="contained"
              onClick={onRemove}
            />
          </span>
        </Tooltip> : null
      }
    </div>
  );

  FeedCollabRow.propTypes = {
    className: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    team: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    onRemove: PropTypes.func.isRequired,
  };

  let error = null;
  const alreadyInvited = feed.feed_invitations?.edges.filter(fi => fi.node.email === textValue).length > 0;
  const alreadyAdded = invites.includes(textValue);

  if (alreadyInvited) {
    error = (
      <FormattedMessage
        defaultMessage="Email address is already invited"
        description="Error message displayed when attempting to send a Shared Feed invitation to an already invited address"
        id="feedCollaboration.alreadyInvited"
      />
    );
  }
  if (alreadyAdded) {
    error = (
      <FormattedMessage
        defaultMessage="Email address is already added to invitations list"
        description="Error message displayed when attempting to send a Shared Feed invitation to an already invited address"
        id="feedCollaboration.alreadyAdded"
      />
    );
  }
  if (textValue.trim() && !EmailValidator.validate(textValue)) {
    error = (
      <FormattedMessage
        defaultMessage="Invalid email address"
        description="Error message displayed when attempting to send a Shared Feed invitation to an invalid address"
        id="feedCollaboration.invalidEmail"
      />
    );
  }

  return (
    <div className={styles['feed-collab-card']}>
      <span className="typography-subtitle2">
        { readOnly ?
          <FormattedMessage
            defaultMessage="Collaborating Organizations [{count}]"
            description="Title of the collaboration box in which feed organizer invites other organizations to a shared feed"
            id="feedCollaboration.titleCollaborator"
            values={{ count: feed.feed_teams?.edges.length }}
          /> :
          <FormattedMessage
            defaultMessage="Collaboration"
            description="Title of the collaboration box in which feed organizer invites other organizations to a shared feed"
            id="feedCollaboration.title"
          />
        }
      </span>
      { !feed.dbid &&
        <span className="typography-body2">
          <FormattedMessage
            defaultMessage="Invite other organizations to contribute data into this shared feed. All contributing organizations to this feed share the same data point."
            description="Description to the feed collaboration management feature"
            id="feedCollaboration.description"
          />
          &nbsp;
          <ExternalLink url="https://help.checkmedia.org/en/articles/8542417-invitation-shared-feed">
            <FormattedMessage
              defaultMessage="Learn more"
              description="Link to knowledge base article on shared feed invitations"
              id="feedCollaboration.learnMore"
            />
          </ExternalLink>
        </span>
      }
      { !readOnly && permissions['create FeedInvitation'] && (
        <div className={styles['feed-collab-input']}>
          <TextField
            className={cx(styles['feed-collab-text-field'], 'int-feed-collab__text-field')}
            error={error}
            helpContent={error}
            placeholder={intl.formatMessage(messages.placeholder)}
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
          />
          <ButtonMain
            className={cx(styles['feed-collab-add-button'], 'int-feed-collab__add-button')}
            disabled={error}
            iconCenter={<AddIcon />}
            size="default"
            theme="info"
            variant="contained"
            onClick={() => handleAdd(textValue)}
          />
        </div>
      )}
      { !feed.dbid && !permissions['create FeedInvitation'] && (
        <Alert
          title={
            <FormattedMessage
              defaultMessage="Contact your workspace admin to add other organizations to this shared feed."
              description="Warning displayed on feed collaboration box on create feed page when user is an editor and can't invite people to the feed."
              id="feedCollaboration.editorWarningCreateFeed"
            />
          }
          variant="warning"
        />
      )}
      <div className={styles['feed-collab-invites']}>
        { feed.feed_teams?.edges
          .filter(ft => !collaboratorsToRemove.map(c => c.value).includes(ft.node.id))
          .map(ft => (
            <FeedCollabRow
              className="feed-collab-row__member"
              key={ft.node.team.name}
              label={ft.node.team.name}
              team={ft.node.team}
              type={ft.node.team.dbid === feed.team.dbid ? 'organizer' : 'collaborator'}
              onRemove={() => handleSelectCollaboratorsToRemove({ label: ft.node.team.name, value: ft.node.id })}
            />
          ))
        }
        { feed.feed_invitations?.edges
          .filter(fi => (fi.node.state === 'invited' && !invitesToDelete.map(i => i.value).includes(fi.node.id)))
          .map(fi => (
            <FeedCollabRow
              className="feed-collab-row__invitation-sent"
              key={fi.node.email}
              label={fi.node.email}
              type="invitation-sent"
              onRemove={() => handleSelectInvitesToDelete({ label: fi.node.email, value: fi.node.id })}
            />
          ))
        }
        { invites.map(email => (
          <FeedCollabRow
            className="feed-collab-row__invitation-new"
            key={email}
            label={email}
            type="invitation-new"
            onRemove={() => handleDelete(email)}
          />
        ))}
      </div>
      { feed.dbid && !permissions['create FeedInvitation'] && (
        <Alert
          title={
            <FormattedMessage
              defaultMessage="Contact your workspace admin to manage Collaborating organizations."
              description="Warning displayed on feed collaboration box on edit feed page when user is an editor and can't invite people to the feed."
              id="feedCollaboration.editorWarningUpdateFeed"
            />
          }
          variant="warning"
        />
      )}
    </div>
  );
};

FeedCollaboration.defaultProps = {
  collaboratorId: null,
  permissions: {},
};

FeedCollaboration.propTypes = {
  collaboratorId: PropTypes.number,
  feed: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  permissions: PropTypes.object, // { key => value } (e.g., { 'create FeedTeam' => true })
  onChange: PropTypes.func.isRequired,
  onChangeInvitesToDelete: PropTypes.func.isRequired,
  onChangeCollaboratorsToRemove: PropTypes.func.isRequired,
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
          state
        }
      }
    }
    team {
      dbid
    }
  }
`);
