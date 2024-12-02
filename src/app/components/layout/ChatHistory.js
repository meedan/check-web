/* eslint-disable react/sort-prop-types */

// DESIGNS: https://www.figma.com/file/bQWUXJItRRX8xO3uQ9FWdg/Multimedia-Newsletter-%2B-Report?type=design&node-id=656-50446&mode=design&t=PjtorENpol0lp5QG-://www.figma.com/file/swpcrmbyoYJXMnqhsVT5sr/Conversation-history-and-messaging-via-request?type=design&node-id=110-15572&mode=design&t=3zQWKZA3YXye2rWF-0
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import IconClose from '../../icons/clear.svg';
import IconDone from '../../icons/done.svg';
import IconFactCheck from '../../icons/fact_check.svg';
import IconBot from '../../icons/smart_toy.svg';
import IconResource from '../../icons/task.svg';
import IconSend from '../../icons/send.svg';
import IconMenuOpen from '../../icons/menu_open.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import Alert from '../cds/alerts-and-prompts/Alert';
import ParsedText from '../ParsedText';
import styles from './ChatHistory.module.css';

const messages = defineMessages({
  unsupportedMessage: {
    id: 'chatHistory.unsupportedMessage',
    defaultMessage: 'Unsupported message',
    description: 'Fallback used in the conversation history when a type of message is not supported',
  },
});

const ChatHistory = ({
  handleClose,
  history,
  intl,
  title,
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
      if (item.payload?.messages && item.payload?.messages[0]?.payload) {
        newItem.userSelection = true;
      }

      return newItem;
    });

    return output;
  };

  const parseItem = (item) => {
    let output = '';

    // Items from us have text directly in the payload, items from users have it in a messages sub-object
    if (item.payload?.text && typeof item.payload?.text === 'string') {
      // Smooch templates are raw text objects that start with the text `&((namespace` and look like
      // &((namespace=[[abc_123_def_456]]template=[[manual_4oct23]]fallback=[[Thank you!]]language=[[en]]body_text=[[09 Oct 16:23]]body_text=[[Thank you!]]))&
      // and we extract the 'fallback' to render this
      if (item.payload?.text.match(/^&\(\(namespace/)) {
        const fallbackMatch = item.payload.text.match(/fallback=\[\[([^\]]+)\]\]/m);
        if (fallbackMatch !== null) {
          // eslint-disable-next-line prefer-destructuring
          output = fallbackMatch[1];
        } else {
          output = item.payload.text;
        }
      } else {
        output = item.payload.text;
      }
    } else if (item.payload?.messages?.length) {
      output = item.payload?.messages?.map(message => message.text).join('//');
    } else if (item.payload?.text && typeof item.payload.text === 'object') {
      output = item.payload.text;
    }

    // parse the payload for a button message to get the text from the capi structure
    if (output === '' && item.payload?.capi?.entry?.[0]?.changes?.[0]?.value?.messages?.length) {
      output = item.payload?.capi?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.button?.text;
    }

    // Hide the machine label for the positive feedback button
    if (typeof output === 'string') {
      output = output.replace('search_result_is_relevant. ', '');
    }

    return output;
  };

  const convertSentAtToLocaleDateString = sent_at => new Date(+sent_at * 1000).toLocaleDateString(intl.locale, { month: 'short', year: 'numeric', day: '2-digit' });

  const parseCapiTemplate = content => (
    content?.components.map(
      // for each sub-object we check to see if it is of a certain type, return the appropriate value given the object
      // type, then flatten the array and join with a double line break
      item => item.parameters.map(
        innerItem => (innerItem.type === 'text' && innerItem.text)
          || (innerItem.type === 'video' && innerItem.video.link)
          || (innerItem.type === 'image' && innerItem.image.link),
      ),
    ).flat().join('\n\n')
  );

  const Message = ({
    content,
    dateTime,
    isDelivered,
    mediaUrl,
    messageEvent,
    messageId,
    userMessage,
    userSelection,
  }) => {
    const d = new Date(dateTime);

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
          { [styles['bot-message']]: !userMessage },
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
            <ParsedText mediaChips text={preParsedText} />
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

  return (
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
      <div className={styles['chat-content']}>
        {parseHistory(history).map((item, index, array) => {
          const content = parseItem(item);
          let dateHeader = null;
          // check to see if the previous item in the array renders a different day in our local timezone
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
                isDelivered={item.isDelivered}
                mediaUrl={item.media_url}
                messageEvent={item.event}
                messageId={item.dbid}
                userMessage={item.direction === 'incoming'}
                userSelection={item.userSelection}
              />
              { dateHeader }
            </div>
          );
        }).sort((a, b) => +b.props.dateTime - +a.props.dateTime)}
        <div className={`typography-body2 ${styles.date}`}>
          {history.length > 0 ? convertSentAtToLocaleDateString(history[history.length - 1].sent_at) : null}
        </div>
        {
          history.length === 0 && (
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
          )
        }
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
  intl: intlShape.isRequired,
};

export default injectIntl(ChatHistory);
