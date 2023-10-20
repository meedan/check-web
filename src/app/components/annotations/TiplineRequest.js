import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './TiplineRequest.module.css';
import TimeBefore from '../TimeBefore';
import FacebookIcon from '../../icons/facebook.svg';
import TwitterIcon from '../../icons/twitter.svg';
import TelegramIcon from '../../icons/telegram.svg';
import ViberIcon from '../../icons/viber.svg';
import LineIcon from '../../icons/line.svg';
import WhatsAppIcon from '../../icons/whatsapp.svg';
import SendTiplineMessage from '../SendTiplineMessage';
import TiplineHistoryButton from './TiplineHistoryButton';
import { languageName } from '../../LanguageRegistry';
import {
  emojify,
  parseStringUnixTimestamp,
} from '../../helpers';
import Request from '../cds/requests-annotations/Request';
import { units } from '../../styles/js/shared';
import RequestReceipt from '../cds/requests-annotations/RequestReceipt';

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
  case 'twitter': return <TwitterIcon style={{ color: 'var(--twitterBlue)' }} />;
  case 'telegram': return <TelegramIcon style={{ color: 'var(--telegramBlue)' }} />;
  case 'viber': return <ViberIcon style={{ color: 'var(--viberPurple)' }} />;
  case 'line': return <LineIcon style={{ color: 'var(--lineGreen)' }} />;
  default: return null;
  }
};

SmoochIcon.propTypes = {
  name: PropTypes.oneOf(['whatsapp', 'messenger', 'twitter', 'telegram', 'viber', 'line']).isRequired,
};

const channelLabel = {
  whatsapp: 'WhatsApp',
  messenger: 'Messenger',
  twitter: 'Twitter',
  telegram: 'Telegram',
  viber: 'Viber',
  line: 'Line',
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
  annotation: activity,
  annotated: projectMedia,
  intl,
}) => {
  const { locale, formatMessage } = intl;

  if (!activity) {
    return null;
  }

  const objectValue = activity.value_json;
  const messageType = objectValue.source?.type;
  const messageText = objectValue.text ?
    objectValue.text.trim()
      .split('\n')
      .map(w => w.replace('\u2063', ''))
      .filter(w => !/^[0-9]+$/.test(w))
      .join('\n')
    : null;
  const updatedAt = parseStringUnixTimestamp(activity.created_at);
  const smoochSlackUrl = activity.smooch_user_slack_channel_url;
  let smoochExternalId = activity.smooch_user_external_identifier;
  if (smoochExternalId && messageType === 'whatsapp') {
    smoochExternalId = smoochExternalId.replace(/^[^:]+:/, '');
  }

  const smoochRequestLanguage = activity.smooch_user_request_language;

  const userName = objectValue.name === 'deleted' ?
    <FormattedMessage id="annotation.deletedUser" defaultMessage="Deleted User" description="Label for deleted user" /> :
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
  if (messageType !== 'telegram' && smoochSlackUrl) {
    details.push((
      <a
        target="_blank"
        style={{ margin: `0 ${units(0.5)}`, textDecoration: 'underline' }}
        rel="noopener noreferrer"
        href={smoochSlackUrl}
      >
        <FormattedMessage
          id="annotation.openInSlack"
          defaultMessage="Open in Slack"
          description="Label for link to conversation in Slack"
        />
      </a>
    ));
  }

  const reportReceiveStatus = {};

  [
    'smooch_report_sent_at',
    'smooch_report_received_at',
    'smooch_report_correction_sent_at',
    'smooch_report_update_received_at',
  ].forEach((field) => {
    if (activity[field]) {
      reportReceiveStatus.type = field;
      reportReceiveStatus.date =
        new Date(parseInt(activity[field], 10) * 1000)
          .toLocaleDateString(locale, { month: 'short', year: 'numeric', day: '2-digit' });
    }
  });

  return (
    <Request
      details={details}
      time={<TimeBefore date={updatedAt} />}
      text={messageText ? (
        parseText(messageText, projectMedia, activity)
      ) : (
        formatMessage(messages.smoochNoMessage)
      )}
      icon={<SmoochIcon name={messageType} />}
      historyButton={
        <TiplineHistoryButton
          uid={uid}
          name={userName}
          channel={channelLabel[messageType] || messageType}
          messageId={messageId}
        />
      }
      sendMessageButton={
        <SendTiplineMessage
          username={userName}
          channel={channelLabel[messageType] || messageType}
          annotationId={activity.annotation_id}
        />
      }
      receipt={
        <RequestReceipt
          type={reportReceiveStatus.type}
          date={reportReceiveStatus.date}
        />
      }
    />
  );
};

TiplineRequest.propTypes = {
  annotation: PropTypes.shape({
    value_json: PropTypes.object.isRequired,
    created_at: PropTypes.string.isRequired,
    smooch_user_slack_channel_url: PropTypes.string,
    smooch_user_external_identifier: PropTypes.string.isRequired,
    smooch_report_received_at: PropTypes.number,
    smooch_report_update_received_at: PropTypes.number,
    associated_graphql_id: PropTypes.string.isRequired,
  }).isRequired,
  annotated: PropTypes.shape({
    id: PropTypes.string.isRequired,
    media: PropTypes.shape({
      file_path: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(TiplineRequest);
