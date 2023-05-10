import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import TelegramIcon from '@material-ui/icons/Telegram';
import TimeBefore from '../TimeBefore';
import RequestSubscription from '../feed/RequestSubscription';
import ViberIcon from '../../icons/viber.svg';
import LineIcon from '../../icons/line.svg';
import { languageName } from '../../LanguageRegistry';
import {
  emojify,
  parseStringUnixTimestamp,
} from '../../helpers';
import Request from '../cds/requests-annotations/Request';
import { units } from '../../styles/js/shared';

const messages = defineMessages({
  smoochNoMessage: {
    id: 'annotation.smoochNoMessage',
    defaultMessage: 'No message was sent with the request',
    description: 'Replacement for tipline requests without a message',
  },
});

const SmoochIcon = ({ name }) => {
  switch (name) {
  case 'whatsapp':
    return (
      <WhatsAppIcon
        style={{
          backgroundColor: 'var(--whatsappGreen)',
          color: 'var(--otherWhite)',
          borderRadius: 4,
          padding: 2,
        }}
      />
    );
  case 'messenger': return <FacebookIcon style={{ color: 'var(--facebookBlue)' }} />;
  case 'twitter': return <TwitterIcon style={{ color: 'var(--twitterBlue)' }} />;
  case 'telegram': return <TelegramIcon style={{ color: 'var(--telegramBlue)' }} />;
  case 'viber': return <ViberIcon style={{ color: 'var(--viberPurple)', fontSize: '24px' }} />;
  case 'line': return <LineIcon style={{ color: 'var(--lineGreen)', fontSize: '24px' }} />;
  default: return null;
  }
};

SmoochIcon.propTypes = {
  name: PropTypes.oneOf(['whatsapp', 'messenger', 'twitter', 'telegram', 'viber', 'line']).isRequired,
};

function parseText(text, projectMedia, activity) {
  let parsedText = text;

  // The unicode character \u2063 is used on the backend to separate messages
  parsedText = parsedText.replace(/[\u2063]/g, '');

  // Replace the external URL of the first media by the Check URL,
  // since the first media is downloaded and saved in Check.
  // Ignore similar items, since it's not the exact same media as the main item.
  if (projectMedia && projectMedia.media && projectMedia.media.file_path && activity.associated_graphql_id === projectMedia.id) {
    parsedText = parsedText.replace(/https:\/\/media.smooch.io[^\s]+/m, projectMedia.media.file_path);
  }

  return emojify(parsedText);
}

const TiplineRequest = ({
  annotation: activity,
  annotated: projectMedia,
  intl,
}) => {
  if (!activity) {
    return null;
  }
  const objectValue = activity.value_json;
  const messageType = objectValue.source.type;
  const messageText = objectValue.text ?
    objectValue.text.trim()
      .split('\n')
      .map(w => w.replace('\u2063', ''))
      .filter(w => !/^[0-9]+$/.test(w))
      .join('\n')
    : null;
  const updatedAt = parseStringUnixTimestamp(activity.created_at);
  const smoochSlackUrl = activity.smooch_user_slack_channel_url;
  const smoochExternalId = activity.smooch_user_external_identifier;
  const smoochReportReceivedAt = activity.smooch_report_received_at ?
    new Date(parseInt(activity.smooch_report_received_at, 10) * 1000) : null;
  const smoochReportUpdateReceivedAt = activity.smooch_report_update_received_at ?
    new Date(parseInt(activity.smooch_report_update_received_at, 10) * 1000) : null;
  const smoochRequestLanguage = activity.smooch_user_request_language;
  const { locale, formatMessage } = intl;

  const details = objectValue.name === 'deleted' ? [(<FormattedMessage id="annotation.deletedUser" defaultMessage="Deleted User" description="Label for deleted user" />)] : [emojify(objectValue.name)];
  if (smoochExternalId && smoochExternalId !== 'deleted') {
    details.push(smoochExternalId);
  }
  if (smoochRequestLanguage) {
    details.push(languageName(smoochRequestLanguage));
  }
  details.push(<TimeBefore date={updatedAt} />);
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

  let reportReceiveStatus = null;

  if (smoochReportReceivedAt) {
    reportReceiveStatus = (
      <FormattedMessage
        id="annotation.reportReceived"
        defaultMessage="Report sent on {date}"
        description="Caption for report sent date"
        values={{
          date: smoochReportReceivedAt.toLocaleDateString(locale, { month: 'short', year: 'numeric', day: '2-digit' }),
        }}
      >
        {text => (
          <span title={text}>
            <RequestSubscription lastCalledAt={smoochReportReceivedAt.toLocaleString(locale)} />
          </span>
        )}
      </FormattedMessage>
    );
  }
  if (smoochReportUpdateReceivedAt) {
    reportReceiveStatus = (
      <FormattedMessage
        id="annotation.reportUpdateReceived"
        defaultMessage="Report update sent on {date}"
        description="Caption for report update sent date"
        values={{
          date: smoochReportUpdateReceivedAt.toLocaleDateString(locale, { month: 'short', year: 'numeric', day: '2-digit' }),
        }}
      >
        {text => (
          <span title={text}>
            <RequestSubscription lastCalledAt={smoochReportUpdateReceivedAt.toLocaleString(locale)} />
          </span>
        )}
      </FormattedMessage>
    );
  }

  if (reportReceiveStatus) {
    details.push(reportReceiveStatus);
  }

  return (
    <Request
      details={details}
      text={messageText ? (
        parseText(messageText, projectMedia, activity)
      ) : (
        formatMessage(messages.smoochNoMessage)
      )}
      icon={<SmoochIcon name={messageType} />}
    />
  );
};

TiplineRequest.propTypes = {
  annotation: PropTypes.shape({
    value_json: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    smooch_user_slack_channel_url: PropTypes.string.isRequired,
    smooch_user_external_identifier: PropTypes.string.isRequired,
    smooch_report_received_at: PropTypes.number.isRequired,
    smooch_report_update_received_at: PropTypes.number.isRequired,
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
