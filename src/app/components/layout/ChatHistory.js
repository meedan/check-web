/* eslint-disable react/sort-prop-types */

// DESIGNS: https://www.figma.com/file/bQWUXJItRRX8xO3uQ9FWdg/Multimedia-Newsletter-%2B-Report?type=design&node-id=656-50446&mode=design&t=PjtorENpol0lp5QG-://www.figma.com/file/swpcrmbyoYJXMnqhsVT5sr/Conversation-history-and-messaging-via-request?type=design&node-id=110-15572&mode=design&t=3zQWKZA3YXye2rWF-0
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import IconClose from '../../icons/clear.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Alert from '../cds/alerts-and-prompts/Alert';
import ChatFeed from '../cds/chat/ChatFeed';
import styles from './ChatHistory.module.css';

const ChatHistory = ({
  handleClose,
  history,
  title,
}) => (
  <div className={styles['chat-history']}>
    <div className={styles['chat-header']}>
      <div className={styles['left-side']}>
        <span className="typography-h6">{title}</span>
      </div>
      <div className={styles['right-side']}>
        <ButtonMain
          iconCenter={<IconClose />}
          size="small"
          theme="text"
          variant="text"
          onClick={handleClose}
        />
      </div>
    </div>
    <ChatFeed
      history={history}
      title={
        <Alert
          title={
            <FormattedMessage
              defaultMessage="Chat history is available beginning March 2023. Contact support for more information."
              description="Informational message that appears when a user accesses a chat history but the messages are too old to display."
              id="chatHistory.noMessages"
            />
          }
          variant="info"
        />
      }
    />
  </div>
);

ChatHistory.defaultProps = {
};

ChatHistory.propTypes = {
  title: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default ChatHistory;
