/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import TelegramIcon from '@material-ui/icons/Telegram';
import ViberIcon from '../../icons/ViberIcon';
import LineIcon from '../../icons/LineIcon';
import ParsedText from '../ParsedText';
import TimeBefore from '../TimeBefore';
import { languageName } from '../../LanguageRegistry';
import {
  emojify,
  parseStringUnixTimestamp,
} from '../../helpers';
import {
  units,
  black38,
  black54,
  checkBlue,
  caption,
  Row,
  twitterBlue,
  facebookBlue,
  whatsappGreen,
  telegramBlue,
  viberPurple,
  lineGreen,
  completedGreen,
  separationGray,
} from '../../styles/js/shared';

// FIXME: Convert styled-components to useStyles
const StyledRequestHeader = styled(Row)`
  color: ${black38};
  flex-flow: wrap row;
  font: ${caption};
  margin-bottom: ${units(2)};

  .separation_dot:before {
    content: '\\25CF ';
    padding: 0 ${units(1)};
    font-size: ${units(1)};
  }

  .annotation__card-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  a, a:visited, a:hover {
    color: ${checkBlue};
    text-decoration: underline;
  }
`;

// FIXME: Convert styled-components to useStyles
const StyledReportReceived = styled.div`
  color: ${black54};
  font: ${caption};
  display: flex;
  align-items: center;
  margin-bottom: ${units(2)};
`;

const SmoochIcon = ({ name }) => {
  switch (name) {
  case 'whatsapp':
    return (
      <WhatsAppIcon
        style={{
          backgroundColor: whatsappGreen,
          color: '#FFF',
          borderRadius: 4,
          padding: 2,
        }}
      />
    );
  case 'messenger': return <FacebookIcon style={{ color: facebookBlue }} />;
  case 'twitter': return <TwitterIcon style={{ color: twitterBlue }} />;
  case 'telegram': return <TelegramIcon style={{ color: telegramBlue }} />;
  case 'viber': return <ViberIcon style={{ color: viberPurple }} />;
  case 'line': return <LineIcon style={{ color: lineGreen }} />;
  default: return null;
  }
};

SmoochIcon.propTypes = {
  name: PropTypes.oneOf(['whatsapp', 'messenger', 'twitter', 'telegram', 'viber', 'line']).isRequired,
};

const useStyles = makeStyles(theme => ({
  root: {
    borderBottom: `1px ${separationGray} solid`,
    padding: `${theme.spacing(4)}px ${theme.spacing(1)}px`,
  },
  name: {
    marginLeft: theme.spacing(1),
  },
}));

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
  const object = JSON.parse(activity.object_after);
  const objectValue = JSON.parse(object.value);
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
  const { locale } = intl;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <StyledRequestHeader>
        <span className="annotation__card-header">
          <SmoochIcon name={messageType} />
          <span className={classes.name}>
            { emojify(objectValue.name) }
          </span>
          { smoochExternalId ?
            <span className="separation_dot">
              {smoochExternalId}
            </span> : null }
          { smoochRequestLanguage ?
            <span className="separation_dot">
              {languageName(smoochRequestLanguage)}
            </span> : null }
          <span className="separation_dot">
            <TimeBefore date={updatedAt} />
          </span>
          { messageType !== 'telegram' && smoochSlackUrl ?
            <span className="separation_dot">
              <a
                target="_blank"
                style={{ margin: `0 ${units(0.5)}`, textDecoration: 'underline' }}
                rel="noopener noreferrer"
                href={smoochSlackUrl}
              >
                <FormattedMessage id="annotation.openInSlack" defaultMessage="Open in Slack" />
              </a>
            </span> : null }
        </span>
      </StyledRequestHeader>
      { smoochReportReceivedAt && !smoochReportUpdateReceivedAt ?
        <StyledReportReceived className="annotation__smooch-report-received">
          <CheckIcon style={{ color: completedGreen }} />
          { /* FIXME: Remove space character and use proper styling for padding */ }
          {' '}
          <span title={smoochReportReceivedAt.toLocaleString(locale)}>
            <FormattedMessage
              id="annotation.reportReceived"
              defaultMessage="Report sent on {date}"
              values={{
                date: smoochReportReceivedAt.toLocaleDateString(locale, { month: 'short', year: 'numeric', day: '2-digit' }),
              }}
            />
          </span>
        </StyledReportReceived> : null }
      { smoochReportUpdateReceivedAt ?
        <StyledReportReceived className="annotation__smooch-report-received">
          <CheckIcon style={{ color: completedGreen }} />
          { /* FIXME: Remove space character and use proper styling for padding */ }
          {' '}
          <span title={smoochReportUpdateReceivedAt.toLocaleString(locale)}>
            <FormattedMessage
              id="annotation.reportUpdateReceived"
              defaultMessage="Report update sent on {date}"
              values={{
                date: smoochReportUpdateReceivedAt.toLocaleDateString(locale, { month: 'short', year: 'numeric', day: '2-digit' }),
              }}
            />
          </span>
        </StyledReportReceived> : null }
      <div className="annotation__card-content">
        <Typography variant="body2">
          { messageText ? (
            <ParsedText text={parseText(messageText, projectMedia, activity)} />
          ) : (
            <FormattedMessage
              id="annotation.smoochNoMessage"
              defaultMessage="No message was sent with the request"
            />
          )}
        </Typography>
      </div>
    </div>
  );
};

TiplineRequest.propTypes = {
  annotation: PropTypes.shape({
    object_after: PropTypes.string.isRequired,
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
