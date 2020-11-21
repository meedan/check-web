import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ParsedText from '../../ParsedText';
import ReportDesignerImagePreview from './ReportDesignerImagePreview';
import { formatDate } from './reportDesignerHelpers';

const useStyles = makeStyles(theme => ({
  root: {
    margin: '0 auto',
  },
  messagePreview: {
    border: '2px solid #DFE4F4',
    borderRadius: '5px',
    backgroundColor: 'white',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: 502,
    color: 'black',
    lineHeight: '1.5em',
  },
}));

function isEmpty(data) {
  if (!data) {
    return true;
  }
  if (Object.keys(data).length === 0 ||
    (!data.use_introduction && !data.use_visual_card && !data.use_text_message)) {
    return true;
  }
  let empty = true;
  Object.keys(data).forEach((key) => {
    if (data[key] !== '') {
      empty = false;
    }
  });
  return empty;
}

function previewIntroduction(data, media) {
  let { introduction } = data;
  if (!introduction) {
    introduction = '';
  } else {
    let firstSmoochRequest = media.first_smooch_request.edges;
    if (firstSmoochRequest.length > 0) {
      firstSmoochRequest = firstSmoochRequest[0].node;
      introduction = introduction.replace(/{{query_date}}/g, formatDate(new Date(parseInt(firstSmoochRequest.created_at, 10) * 1000), data.language));
    } else {
      introduction = introduction.replace(/{{query_date}}/g, formatDate(new Date(), data.language));
    }
    introduction = introduction.replace(/{{status}}/g, data.status_label);
  }
  return introduction;
}

const ReportDesignerPreview = (props) => {
  const classes = useStyles();
  const { data, media } = props;

  if (isEmpty(data)) {
    return (
      <Box className={[classes.messagePreview, classes.root].join(' ')}>
        <FormattedMessage
          id="reportDesigner.nothingToPreview"
          defaultMessage="Start creating your report to preview what users will see when they receive it."
        />
      </Box>
    );
  }

  const text = [];
  if (data.title) {
    text.push(`*${data.title}*`);
  }
  if (data.text) {
    text.push(data.text);
  }
  if (data.disclaimer) {
    text.push(`_${data.disclaimer}_`);
  }

  const introduction = previewIntroduction(data, media);

  // Preview for the introduction, the text message, and the visual card
  return (
    <Box className={classes.root}>
      { data.use_introduction ?
        <Box className={classes.messagePreview}>
          { introduction ? (
            <ParsedText text={introduction} />
          ) : (
            <FormattedMessage
              id="reportDesigner.addIntro"
              defaultMessage="Add content to the introduction"
            />
          )}
        </Box> : null }
      { data.use_text_message ?
        <Box className={classes.messagePreview}>
          { text.length ? (
            <ParsedText text={text.join('\n\n')} block />
          ) : (
            <FormattedMessage
              id="reportDesigner.addText"
              defaultMessage="Add content to the text message"
            />
          )}
        </Box> : null }
      { data.use_visual_card ?
        <Box className={classes.visualCardPreview}>
          <ReportDesignerImagePreview
            style={{
              width: 500,
              height: 500,
            }}
            image={
              data.image
                // data.image is either String (from backend) or File (from upload).
                // <ReportImagePreview> needs String.
                ? (data.image.preview || data.image)
                : media.media.picture
            }
            teamAvatar={media.team.avatar}
            params={data}
            template={media.team.get_report_design_image_template}
            date={data.date || formatDate(new Date(), data.language)}
          />
        </Box> : null }
    </Box>
  );
};

ReportDesignerPreview.propTypes = {
  data: PropTypes.object.isRequired,
  media: PropTypes.object.isRequired,
};

export default ReportDesignerPreview;
