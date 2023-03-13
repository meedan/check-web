import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, FormattedMessage, intlShape } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CheckChannels from '../../CheckChannels';

const useStyles = makeStyles(() => ({
  createdBy: {
    fontSize: '9px',
  },
}));

const messages = defineMessages({
  import: {
    id: 'mediaAnalysis.import',
    defaultMessage: 'Import',
    description: 'Creator that refers to items created via Fetch or Zapier.',
  },
  tipline: {
    id: 'mediaAnalysis.tipline',
    defaultMessage: 'Tipline',
    description: 'Creator that refers to items created via tiplines.',
  },
  webform: {
    id: 'mediaAnalysis.webForm',
    defaultMessage: 'Web Form',
    description: 'Creator that refers to items created via web forms.',
  },
  shareddatabase: {
    id: 'mediaAnalysis.sharedFeed',
    defaultMessage: 'Shared Feed',
    description: 'Creator that refers to items created from the shared feed.',
  },
});

const MediaCreatedBy = ({ projectMedia, intl }) => {
  const {
    creator_name: creatorName,
    user_id: userId,
    channel,
  } = projectMedia;
  const classes = useStyles();

  const showUserName = [CheckChannels.MANUAL, CheckChannels.BROWSER_EXTENSION].indexOf(channel.toString()) !== -1;
  const channelNameKey = creatorName?.replace(/[ _-]+/g, '').toLocaleLowerCase();
  const formattedChannelName = Object.keys(messages).includes(channelNameKey) ? intl.formatMessage(messages[channelNameKey]) : creatorName;

  return (
    <Typography className={classes.createdBy} variant="body1" component="div">
      <FormattedMessage
        id="mediaCreatedBy.createdBy"
        defaultMessage="Item created by {name}"
        values={{
          name: showUserName ? <a href={`/check/user/${userId}`}>{creatorName}</a> : formattedChannelName,
        }}
        description="A text field that indicates who the original author of a claim is. The {name} field will render the display name of the user who created the item."
      />
    </Typography>
  );
};

MediaCreatedBy.propTypes = {
  projectMedia: PropTypes.shape({
    user_id: PropTypes.number.isRequired,
    creator_name: PropTypes.string.isRequired,
    channel: PropTypes.object.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(MediaCreatedBy);
