import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import cx from 'classnames/bind';
import * as EmailValidator from 'email-validator';
import styles from './FeedCollaboration.module.css';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import AddIcon from '../../icons/add.svg';
import ClearIcon from '../../icons/clear.svg';
import PersonAddIcon from '../../icons/person_add.svg';
import ScheduleSendIcon from '../../icons/schedule_send.svg';
import TeamAvatar from '../team/TeamAvatar';

const messages = defineMessages({
  placeholder: {
    id: 'feedCollaboration.placeholder',
    defaultMessage: 'Add collaborator',
    description: 'Placeholder of the input field for invited organizations',
  },
});

const FeedCollaboration = ({
  feed,
  intl,
  onChange,
}) => {
  const [textValue, setTextValue] = React.useState(null);
  const [invites, setInvites] = React.useState([]);

  const handleAdd = (email) => {
    if (EmailValidator.validate(email)) {
      const newInvites = [...invites];
      newInvites.push(email);
      setTextValue(null);
      setInvites(newInvites);
      onChange(newInvites);
    }
  };

  const handleDelete = (email) => {
    const newInvites = [...invites];
    newInvites.splice(newInvites.indexOf(email), 1);
    setInvites(newInvites);
  };

  const FeedCollabRow = ({
    label,
    team,
    type,
  }) => (
    <div className={styles['feed-collab-row']} key={label}>
      { !team &&
        <div
          className={cx(
            styles['feed-collab-icon'],
            {
              [styles.invitationSentIcon]: type === 'invitation-sent',
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
        </span>
        :
        <Tooltip arrow title={<FormattedMessage id="feedCollaboration.remove" defaultMessage="Remove" description="Tooltip for button to remove invitation or feed collaborator" />}>
          <span>
            <ButtonMain
              onClick={() => handleDelete(label)}
              iconCenter={<ClearIcon />}
              variant="contained"
              size="small"
              theme="lightText"
            />
          </span>
        </Tooltip>
      }
    </div>
  );

  return (
    <div className={styles['feed-collab-card']}>
      <span className="typography-subtitle2">
        <FormattedMessage
          id="feedCollaboration.title"
          defaultMessage="Collaboration"
          description="Title of the collaboration box in which feed organizer invites other organizations to a shared feed"
        />
      </span>
      <FormattedMessage
        id="feedCollaboration.description"
        defaultMessage="Invite other organizations to contribute data into this shared feed. All contributing organizations to this feed share the same data point."
        description="Description to the feed collaboration management feature"
      />
      { /* TODO add "Learn more" link */}
      <div className={styles['feed-collab-input']}>
        <TextField
          className={styles['feed-collab-text-field']}
          value={textValue}
          placeholder={intl.formatMessage(messages.placeholder)}
          onChange={e => setTextValue(e.target.value)}
        />
        <ButtonMain
          onClick={() => handleAdd(textValue)}
          iconCenter={<AddIcon />}
          size="large"
          disabled={!EmailValidator.validate(textValue)}
        />
      </div>
      <div className={styles['feed-collab-invites']}>
        {feed.teams?.edges.map(t => ( // FIXME this should be `feed.feed_teams` instead
          <FeedCollabRow
            label={t.node.name}
            team={t.node}
            type={t.node.dbid === feed.team.dbid ? 'organizer' : 'collaborator'}
          />
        ))}
        {feed.feed_invitations?.edges.map(i => (
          <FeedCollabRow label={i.node.email} type="invitation-sent" />
        ))}
        {invites.map(email => (
          <FeedCollabRow label={email} type="invitation-new" />
        ))}
      </div>
    </div>
  );
};

FeedCollaboration.propTypes = {
  feed: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default injectIntl(FeedCollaboration);
