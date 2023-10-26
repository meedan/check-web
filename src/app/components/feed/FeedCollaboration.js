import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import * as EmailValidator from 'email-validator';
import styles from './FeedCollaboration.module.css';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import AddIcon from '../../icons/add.svg';
import ClearIcon from '../../icons/clear.svg';
import PersonAddIcon from '../../icons/person_add.svg';

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

  console.log('textValue', textValue); // eslint-disable-line

  const handleAdd = (email) => {
    if (EmailValidator.validate(email)) {
      console.log('email', email); // eslint-disable-line
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
        defaultMessage="Invite other organizations to contribute data into this shared feed. All contributing organizations to this feed share the same data point. Learn more"
        description="Description to the feed collaboration management feature"
      />
      <div className={styles['feed-collab-input']}>
        <TextField
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
        {feed.teams?.edges.map(t => <div>{t.node.name}</div>)}
        {feed.feed_invitations?.edges.map(i => <div>{i.node.email}</div>)}
        { invites.map(invite => (
          <div className={styles['feed-collab-row']} key={invite}>
            <div className={styles['feed-collab-icon']}>
              <PersonAddIcon />
            </div>
            {invite}
            <Tooltip arrow title={<FormattedMessage id="feedCollaboration.remove" defaultMessage="Remove" description="Tooltip for button to remove invitation or feed collaborator" />}>
              <span>
                <ButtonMain
                  onClick={() => handleDelete(invite)}
                  iconCenter={<ClearIcon />}
                  variant="contained"
                  size="default"
                  theme="lightText"
                />
              </span>
            </Tooltip>
          </div>
        )) }
      </div>
    </div>
  );
};

export default injectIntl(FeedCollaboration);
