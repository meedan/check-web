import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import IconDone from '../../../icons/done.svg';
import IconFactCheck from '../../../icons/fact_check.svg';
import IconBot from '../../../icons/smart_toy.svg';
import IconResource from '../../../icons/task.svg';
import IconSend from '../../../icons/send.svg';
import IconMenuOpen from '../../../icons/menu_open.svg';
import Tooltip from '../alerts-and-prompts/Tooltip';
import ParsedText from '../../ParsedText';
import styles from './ChatFeed.module.css';

const messages = defineMessages({
  unsupportedMessage: {
    id: 'chatHistory.unsupportedMessage',
    defaultMessage: 'Unsupported message',
    description: 'Fallback used in the conversation history when a type of message is not supported',
  },
});

const Message = ({
  content,
  dateTime,
  intl,
  isDelivered,
  mediaUrl,
  messageEvent,
  messageId,
  userMessage,
  userOnRight,
  userSelection,
}) => {
  const d = new Date(dateTime);

  const parseCapiTemplate = items => (
    items?.components.map(
      // for each sub-object we check to see if it is of a certain type, return the appropriate value given the object
      // type, then flatten the array and join with a double line break
      item => item.parameters.map(
        innerItem => (innerItem.type === 'text' && innerItem.text)
          || (innerItem.type === 'video' && innerItem.video.link)
          || (innerItem.type === 'image' && innerItem.image.link),
      ),
    ).flat().join('\n\n')
  );

  let preParsedText = (
    typeof content === 'object' ? // It's probably a CapiTemplate Cloud API template message, which is an object
      parseCapiTemplate(content.template) :
      content
  );

  // Concatenate with a media URL if there is one
  if (mediaUrl) {
    preParsedText = [mediaUrl, preParsedText].filter(contentSection => !!contentSection).join('\n\n');
  }

  // Unsupported message (for example, a document, reaction, etc.
  if (!preParsedText) {
    preParsedText = intl.formatMessage(messages.unsupportedMessage);
  }

  // Return a proper icon for the message event type
  let icon = null;
  if (userSelection) {
    icon = <IconMenuOpen />;
  } else if (!userMessage) {
    switch (messageEvent) {
    case 'report':
    case 'search_result':
      icon = <IconFactCheck />;
      break;
    case 'resource':
      icon = <IconResource />;
      break;
    case 'custom_message':
    case 'newsletter':
    case 'status_change':
      icon = <IconSend />;
      break;
    default:
      icon = <IconBot />;
    }
  }

  return (
    <div
      className={cx(
        styles.message,
        { [styles.right]: (userMessage && userOnRight) || (!userMessage && !userOnRight) },
      )}
      id={`message-${messageId}`}
    >
      { preParsedText ?
        <div className={cx(
          'typography-body1',
          styles[`message-event-${messageEvent ? messageEvent.replaceAll('_', '-') : 'default'}`],
          {
            [styles.user]: userMessage,
            [styles.bot]: !userMessage,
            [styles.selection]: userSelection,
          },
        )}
        >
          {userMessage && <p>User: </p>} <ParsedText mediaChips text={preParsedText} />
        </div> : null }
      <div className={`typography-body2 ${styles.time}`}>
        {icon}
        <Tooltip title={d.toLocaleString()}>
          <time dateTime={d.toISOString()}>{d.toLocaleTimeString(intl.locale)}</time>
        </Tooltip>
        {isDelivered && <IconDone className={styles.delivered} />}
      </div>
    </div>
  );
};

export default injectIntl(Message);
