import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import styled from 'styled-components';
import CheckIcon from '@material-ui/icons/Check';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import { makeStyles } from '@material-ui/core/styles';
import ParsedText from '../ParsedText';
import TimeBefore from '../TimeBefore';
import {
  emojify,
  parseStringUnixTimestamp,
} from '../../helpers';
import {
  units,
  black38,
  black54,
  black87,
  checkBlue,
  caption,
  Row,
  twitterBlue,
  facebookBlue,
  whatsappGreen,
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

// FIXME: Convert styled-components to useStyles
const StyledRequest = styled.div`
  font-size: ${units(1.75)};
  color: ${black87};

  a, a:visited, a:hover {
    color: ${checkBlue};
    text-decoration: underline;
  }
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
  default: return null;
  }
};

SmoochIcon.propTypes = {
  name: PropTypes.oneOf(['whatsapp', 'messenger', 'twitter']).isRequired,
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

const TiplineRequest = ({
  annotation: activity,
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
          <span className="separation_dot">
            <TimeBefore date={updatedAt} />
          </span>
          { smoochSlackUrl ?
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
              defaultMessage="Report received on {date}"
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
              defaultMessage="Report update received on {date}"
              values={{
                date: smoochReportUpdateReceivedAt.toLocaleDateString(locale, { month: 'short', year: 'numeric', day: '2-digit' }),
              }}
            />
          </span>
        </StyledReportReceived> : null }
      <div className="annotation__card-content">
        {messageText ? (
          <StyledRequest>
            <ParsedText text={emojify(messageText.replace(/[\u2063]/g, ''))} />
          </StyledRequest>
        ) : (
          <FormattedMessage
            id="annotation.smoochNoMessage"
            defaultMessage="No message was sent with the request"
          />
        )}
      </div>
    </div>
  );
};

export default injectIntl(TiplineRequest);
