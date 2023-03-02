import React from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { textPrimary, textSecondary } from '../../styles/js/shared';

/*
  How should I specify props? Discrete props or pass down projectMedia?
*/
const MediaCardLargeFooterContent = ({
  body,
  title,
  type,
}) => {
  const transcriptionLabel = (
    <FormattedMessage
      id="mediaCardLargeFooterContent.transcription"
      defaultMessage="Transcription"
      description="Header for the transcription content of an audio or video"
    />
  );

  const label = type === 'Transcription' ? transcriptionLabel : title;

  return (
    <>
      <div>
        <Typography variant="body1">
          <Box color={textSecondary}>
            {label}
          </Box>
          <Box color={textPrimary}>
            {body}
          </Box>
        </Typography>
      </div>
    </>
  );
};

export default MediaCardLargeFooterContent;
