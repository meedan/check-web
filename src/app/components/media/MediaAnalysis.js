import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import MediaAnalysisField from './MediaAnalysisField';

const MediaAnalysis = ({ projectMedia }) => {
  const analysis = projectMedia.last_status_obj;

  if (!analysis) {
    return null;
  }

  const getValue = (fieldName) => {
    let fieldValue = null;
    const fieldObj = analysis.data.fields.find(field => (
      field.field_name === fieldName
    ));
    if (fieldObj && fieldObj.value && fieldObj.value !== '') {
      fieldValue = fieldObj.value;
    }
    return fieldValue;
  };

  const title = getValue('title');
  const content = getValue('content');

  if (!content) {
    return null;
  }

  return (
    <Box id="media__analysis">
      <Box my={2}>
        <Divider />
      </Box>
      <Box mt={2} mb={3}>
        <Typography variant="body" component="div" paragraph>
          <strong>
            <FormattedMessage id="mediaAnalysis.analysis" defaultMessage="Analysis" description="Title of the media analysis bar" />
          </strong>
          {' '}
          <FormattedMessage
            id="mediaAnalysis.discontinued"
            defaultMessage="(Discontinued - {learnMoreLink})"
            description="Caption that informs that the analysis feature is deprecated."
            values={{
              learnMoreLink: (
                <a href="https://help.checkmedia.org/en/articles/4471254-analysis-panel" target="_blank" rel="noopener noreferrer">
                  <FormattedMessage id="mediaAnalysis.learnMore" defaultMessage="Learn more" description="Text that links to an external help article" />
                </a>
              ),
            }}
          />
        </Typography>
      </Box>

      <MediaAnalysisField
        name="title"
        value={title}
        label={
          <FormattedMessage id="mediaAnalysis.title" defaultMessage="Title" description="Label for the analysis title field" />
        }
      />

      <MediaAnalysisField
        name="content"
        value={content}
        label={
          <FormattedMessage id="mediaAnalysis.content" defaultMessage="Content" description="Label for the analysis content field" />
        }
      />
    </Box>
  );
};

MediaAnalysis.defaultProps = {
  projectMedia: { last_status_obj: null },
};

MediaAnalysis.propTypes = {
  projectMedia: PropTypes.shape({
    last_status_obj: PropTypes.object,
  }),
};

export default MediaAnalysis;
