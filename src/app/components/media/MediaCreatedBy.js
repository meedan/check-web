import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, FormattedMessage, intlShape } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import CheckChannels from '../../CheckChannels';

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
});

const MediaCreatedBy = ({ projectMedia, intl }) => {
  const {
    creator_name: creatorName,
    user_id: userId,
    channel,
  } = projectMedia;

  const showUserName = [CheckChannels.MANUAL, CheckChannels.BROWSER_EXTENSION].indexOf(channel.toString()) !== -1;

  return (
    <Typography variant="body" component="div">
      <FormattedMessage
        id="mediaCreatedBy.createdBy"
        defaultMessage="Item created by {name}"
        values={{
          name: showUserName ? <a href={`/check/user/${userId}`}>{creatorName}</a> : intl.formatMessage(messages[creatorName.replace(/[ _-]/g, '').toLocaleLowerCase()]),
        }}
      />
    </Typography>
  );
};

MediaCreatedBy.propTypes = {
  projectMedia: PropTypes.shape({
    user_id: PropTypes.number.isRequired,
    creator_name: PropTypes.string.isRequired,
    channel: PropTypes.string.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(MediaCreatedBy);
