import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import TiplineHistoryButton from './TiplineHistoryButton';
import TimeBefore from '../TimeBefore';
import FacebookIcon from '../../icons/facebook.svg';
import TwitterIcon from '../../icons/twitter.svg';
import TelegramIcon from '../../icons/telegram.svg';
import ViberIcon from '../../icons/viber.svg';
import LineIcon from '../../icons/line.svg';
import WhatsAppIcon from '../../icons/whatsapp.svg';
import InstagramIcon from '../../icons/instagram.svg';
import SendTiplineMessage from '../SendTiplineMessage';
import { languageName } from '../../LanguageRegistry';
import {
  emojify,
  parseStringUnixTimestamp,
} from '../../helpers';
import Request from '../cds/requests-annotations/Request';
import RequestReceipt from '../cds/requests-annotations/RequestReceipt';
import styles from './TiplineRequest.module.css';

const messages = defineMessages({
  smoochNoMessage: {
    id: 'annotation.smoochNoMessage',
    defaultMessage: 'No message was sent with the request',
    description: 'Replacement for tipline requests without a message',
  },
});

const SmoochIcon = ({ name }) => {
  switch (name) {
  case 'whatsapp': return <WhatsAppIcon style={{ color: 'var(--whatsappGreen)' }} />;
  case 'messenger': return <FacebookIcon style={{ color: 'var(--facebookBlue)' }} />;
  case 'twitter': return <TwitterIcon style={{ color: 'var(--xBlack)' }} />;
  case 'telegram': return <TelegramIcon style={{ color: 'var(--telegramBlue)' }} />;
  case 'viber': return <ViberIcon style={{ color: 'var(--viberPurple)' }} />;
  case 'line': return <LineIcon style={{ color: 'var(--lineGreen)' }} />;
  case 'instagram': return <InstagramIcon style={{ color: 'var(--instagramPink)' }} />;
  default: return null;
  }
};

SmoochIcon.propTypes = {
  name: PropTypes.oneOf(['whatsapp', 'messenger', 'twitter', 'telegram', 'viber', 'line', 'instagram']).isRequired,
};

const channelLabel = {
  whatsapp: 'WhatsApp',
  messenger: 'Messenger',
  twitter: 'Twitter',
  telegram: 'Telegram',
  viber: 'Viber',
  line: 'Line',
  instagram: 'Instagram',
};

function parseText(text, projectMedia, activity) {
  let parsedText = text;

  // The unicode character \u2063 is used on the backend to separate messages
  parsedText = parsedText.replace(/[\u2063]/g, '');

  // Replace the external URL of the first media by the Check URL,
  // since the first media is downloaded and saved in Check.
  // Ignore similar items, since it's not the exact same media as the main item.
  if (projectMedia && projectMedia.media && projectMedia.media.file_path && activity.associated_graphql_id === projectMedia.id) {
    parsedText = parsedText.replace(/https:\/\/media\.smooch\.io[^\s]+/m, projectMedia.media.file_path);
  }

  return emojify(parsedText);
}

const TiplineRequest = ({
  annotated: projectMedia,
  annotation: activity,
  hideButtons,
  intl,
}) => {
  if (!activity) {
    return null;
  }

  const objectValue = activity.smooch_data;
  const messageType = objectValue.source?.type;
  const messageText = objectValue.text ?
    objectValue.text.trim()
      .split('\n')
      .map(w => w.replace('\u2063', ''))
      .filter(w => !/^[0-9]{1,2}$/.test(w))
      .join('\n')
    : null;
  const updatedAt = parseStringUnixTimestamp(activity.created_at);
  let smoochExternalId = activity.smooch_user_external_identifier;
  if (smoochExternalId && messageType === 'whatsapp') {
    smoochExternalId = smoochExternalId.replace(/^[^:]+:/, '');
  }

  const smoochRequestLanguage = activity.smooch_user_request_language;

  const userName = objectValue.name === 'deleted' ?
    <FormattedMessage defaultMessage="Deleted User" description="Label for deleted user" id="annotation.deletedUser" /> :
    emojify(objectValue.name);
  // the unique ID of the conversation associated with this media item
  const uid = objectValue.authorId;
  // the ID of the specific message of this submission
  const messageId = objectValue._id; // eslint-disable-line no-underscore-dangle

  const details = [<strong className={styles['user-name']}>{userName}</strong>];

  if (smoochExternalId && smoochExternalId !== 'deleted') {
    details.push(smoochExternalId);
  }
  if (smoochRequestLanguage) {
    details.push(languageName(smoochRequestLanguage));
  }

  const reportHistory = [];

  if (
    [
      'timeout_search_requests',
      'relevant_search_result_requests',
    ].includes(activity.smooch_request_type)
  ) {
    reportHistory.push({ type: activity.smooch_request_type });
  }

  [
    'smooch_report_sent_at',
    'smooch_report_received_at',
    'smooch_report_correction_sent_at',
    'smooch_report_update_received_at',
  ].forEach((field) => {
    const value = activity[field];
    if (value) {
      reportHistory.push({ type: field, date: value });
    }
  });

  return (
    <Request
      details={details}
      historyButton={(
        !hideButtons && <TiplineHistoryButton
          channel={channelLabel[messageType] || messageType}
          messageId={messageId}
          name={userName}
          uid={uid}
        />
      )}
      icon={<SmoochIcon name={messageType} />}
      receipt={<RequestReceipt events={reportHistory} />}
      sendMessageButton={(
        !hideButtons && <SendTiplineMessage
          annotationId={activity.dbid}
          channel={channelLabel[messageType] || messageType}
          username={userName}
        />
      )}
      text={messageText ? (
        parseText(messageText, projectMedia, activity)
      ) : (
        intl.formatMessage(messages.smoochNoMessage)
      )}
      time={<TimeBefore date={updatedAt} includeTime />}
    />
  );
};

TiplineRequest.defaultProps = {
  hideButtons: false,
};

TiplineRequest.propTypes = {
  annotated: PropTypes.shape({
    id: PropTypes.string.isRequired,
    media: PropTypes.shape({
      file_path: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  annotation: PropTypes.shape({
    smooch_data: PropTypes.object.isRequired,
    created_at: PropTypes.string.isRequired,
    smooch_user_external_identifier: PropTypes.string.isRequired,
    smooch_report_received_at: PropTypes.number,
    smooch_report_update_received_at: PropTypes.number,
    associated_graphql_id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
  }).isRequired,
  hideButtons: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(TiplineRequest);
