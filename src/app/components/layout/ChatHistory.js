// DESIGNS: https://www.figma.com/file/bQWUXJItRRX8xO3uQ9FWdg/Multimedia-Newsletter-%2B-Report?type=design&node-id=656-50446&mode=design&t=PjtorENpol0lp5QG-://www.figma.com/file/swpcrmbyoYJXMnqhsVT5sr/Conversation-history-and-messaging-via-request?type=design&node-id=110-15572&mode=design&t=3zQWKZA3YXye2rWF-0
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import IconClose from '../../icons/cancel.svg';
import IconDone from '../../icons/done.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import styles from './ChatHistory.module.css';

const ChatHistory = ({
  title,
  history,
  handleClose,
}) => {
  const parseHistory = () => {
    let output = history;
    // Get a list of ids of all 'delivered' messages
    const deliveredIds = history.filter(item => item.state === 'delivered').map(item => item.external_id);

    // Remove all 'delivered' messages from main history
    output = output.filter(item => item.state !== 'delivered');

    // Apply an `isDelivered` to items that got a delivery confirmation
    output = output.map((item) => {
      const newItem = item;
      newItem.isDelivered = deliveredIds.includes(item.external_id);
      return newItem;
    });

    return output;
  };

  const parseItem = (item) => {
    let output = '';

    if (item.payload?.text) {
      output = item.payload.text;
    } else if (item.payload.messages?.length) {
      output = item.payload.messages[0]?.text || 'NO TEXT';
    } else {
      output = 'AN OBJECT';
    }
    return output;
  };

  const convertSentAtToLocaleDateString = sent_at => new Date(+sent_at * 1000).toLocaleDateString();

  const Message = ({
    content,
    dateTime,
    userMessage,
    isDelivered,
  }) => {
    const d = new Date(dateTime);
    return (
      <div className={cx(styles.message, {
        [styles['bot-message']]: !userMessage,
      })}
      >
        <div className={cx(
          'typography-body1',
          {
            [styles.user]: userMessage,
            [styles.bot]: !userMessage,
          },
        )}
        >
          {content}
        </div>
        <div className={`typography-body2 ${styles.time}`}>
          <Tooltip title={d.toLocaleString()}>
            <time dateTime={d.toISOString()}>{d.toLocaleTimeString()}</time>
          </Tooltip>
          {isDelivered && <IconDone className={styles.delivered} />}
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
          <ButtonMain
            variant="text"
            size="medium"
            theme="text"
            iconCenter={<IconClose />}
            onClick={handleClose}
          />
        </div>
      </div>
      <div className={styles['chat-content']}>
        {parseHistory(history).map((item, index, array) => {
          const content = parseItem(item);
          let dateHeader = null;
          // check to see if the previous item in the array renders a different day in our local timzone
          // and then insert a date header if we have crossed a local date boundary between messages
          if (array[index - 1]?.sent_at) {
            const lastMessageDateFormatted = convertSentAtToLocaleDateString(array[index - 1]?.sent_at);
            const currentMessageDateFormatted = convertSentAtToLocaleDateString(array[index]?.sent_at);
            if (lastMessageDateFormatted !== currentMessageDateFormatted) {
              dateHeader = (
                <div className={`typography-body2 ${styles.date}`}>
                  {lastMessageDateFormatted}
                </div>
              );
            }
          }
          const dateTime = +item.sent_at * 1000;
          return (
            <div dateTime={dateTime}>
              <Message
                content={content}
                dateTime={dateTime}
                userMessage={item.direction === 'incoming'}
                isDelivered={item.isDelivered}
              />
              { dateHeader }
            </div>
          );
        }).sort((a, b) => +b.props.dateTime - +a.props.dateTime)}
        <div className={`typography-body2 ${styles.date}`}>
          {convertSentAtToLocaleDateString(history[history.length - 1].sent_at)}
        </div>
      </div>
    </div>
  );
};

ChatHistory.defaultProps = {
};

ChatHistory.propTypes = {
  title: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default ChatHistory;
