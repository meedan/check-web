// DESIGNS: https://www.figma.com/file/bQWUXJItRRX8xO3uQ9FWdg/Multimedia-Newsletter-%2B-Report?type=design&node-id=656-50446&mode=design&t=PjtorENpol0lp5QG-://www.figma.com/file/swpcrmbyoYJXMnqhsVT5sr/Conversation-history-and-messaging-via-request?type=design&node-id=110-15572&mode=design&t=3zQWKZA3YXye2rWF-0
import React from 'react';
import PropTypes from 'prop-types';
import IconClose from '../../icons/cancel.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import styles from './ChatHistory.module.css';

const ChatHistory = ({
  title,
  history,
}) => {
  // eslint-disable-next-line
  console.log('~~~',)

  const Message = ({
    content,
    datetime,
    userMessage,
  }) => {
    const d = new Date(datetime);
    return (
      <div className={styles.message}>
        <div className={`typography-body1 ${userMessage && styles.user}`}>
          {content}
        </div>
        <div className={`typography-body2 ${styles.time}`}>
          {d.toLocaleTimeString()}
        </div>
      </div>
    );
  };

  return (
    <div className={styles['chat-history']}>
      <div className={styles['chat-header']}>
        <div className={styles['left-side']}>
          <span className="typography-h6">{title}</span>
        </div>
        <div className={styles['right-side']}>
          <ButtonMain variant="text" size="medium" theme="text" iconCenter={<IconClose />} />
        </div>
      </div>
      <div className={styles['chat-content']}>
        <div className={`typography-body2 ${styles.date}`}>
          Aug 20, 2023
        </div>
        {history.map(item => (
          <Message
            content={item.content}
            datetime={item.datetime}
          />
        ))}
      </div>
    </div>
  );
};

ChatHistory.defaultProps = {
};

ChatHistory.propTypes = {
  title: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default ChatHistory;
