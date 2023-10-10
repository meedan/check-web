// DESIGNS: https://www.figma.com/file/bQWUXJItRRX8xO3uQ9FWdg/Multimedia-Newsletter-%2B-Report?type=design&node-id=656-50446&mode=design&t=PjtorENpol0lp5QG-://www.figma.com/file/swpcrmbyoYJXMnqhsVT5sr/Conversation-history-and-messaging-via-request?type=design&node-id=110-15572&mode=design&t=3zQWKZA3YXye2rWF-0
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Linkify from 'react-linkify';
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

    // Apply various helper properties to items
    output = output.map((item) => {
      const newItem = item;
      // Apply an `isDelivered` to items that got a delivery confirmation
      newItem.isDelivered = deliveredIds.includes(item.external_id);

      // Apply a `userSelection` to items where the user selected from a menu of options
      // if a user message has a "payload" sub-item then it was a user selection from a menu of options
      if (item.payload.messages && item.payload.messages[0]?.payload) {
        newItem.userSelection = true;
      }

      return newItem;
    });

    return output;
  };

  const parseItem = (item) => {
    let output = '';

    // Items from us have text directly in the payload, items from users have it in a messages sub-object
    if (item.payload?.text) {
      output = item.payload.text;
    } else if (item.payload.messages?.length) {
      output = item.payload.messages.map(message => message.text).join('//');
    }

    return output;
  };

  const convertSentAtToLocaleDateString = sent_at => new Date(+sent_at * 1000).toLocaleDateString();

  const parseWhatsApp = (content) => {
    // eslint-disable-next-line
    console.log('~~~',content);
    return content.components.map(
      item => item.parameters.map(
        innerItem => (innerItem.type === 'text' && innerItem.text)
          || (innerItem.type === 'video' && innerItem.video.link)
          || (innerItem.type === 'image' && innerItem.image.link),
      ),
    ).flat().join('\n\n');
  };

  const Message = ({
    content,
    dateTime,
    userMessage,
    isDelivered,
    userSelection,
  }) => {
    const d = new Date(dateTime);
    return (
      <div className={cx(styles.message, {
        [styles['bot-message']]: !userMessage,
      })}
      >
        <Linkify className={cx(
          'typography-body1',
          {
            [styles.user]: userMessage,
            [styles.bot]: !userMessage,
            [styles.selection]: userSelection,
          },
        )}
        >
          {
            typeof content === 'object' ? // It's probably a WhatsApp Cloud API template message, which is an object
              parseWhatsApp(content.template) :
              content
          }
        </Linkify>
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
                userSelection={item.userSelection}
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
