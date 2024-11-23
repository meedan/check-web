import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import Message from './Message';
import styles from './ChatFeed.module.css';

const ChatFeed = ({
  history,
  intl,
  title,
  userOnRight,
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

  return (
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
              userOnRight={userOnRight}
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
        history.length === 0 &&
          <>
            {title}
          </>
      }
    </div>
  );
};

ChatFeed.defaultProps = {
  userOnRight: false,
};

ChatFeed.propTypes = {
  history: PropTypes.object.isRequired,
  title: PropTypes.oneOf([PropTypes.object, PropTypes.string]).isRequired,
  userOnRight: PropTypes.bool,
};

export default injectIntl(ChatFeed);
