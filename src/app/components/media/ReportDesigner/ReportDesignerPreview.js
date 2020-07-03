import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ParsedText from '../../ParsedText';
import ReportDesignerImagePreview from './ReportDesignerImagePreview';

const useStyles = makeStyles(theme => ({
  root: {
    margin: '0 auto',
  },
  box: {
    border: '1px solid black',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: 502,
    color: 'black',
  },
}));

function isEmpty(data) {
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

function formatDate(date, language) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat(language.replace('_', '-'), options).format(date);
}

function previewIntroduction(data) {
  let { introduction } = data;
  if (!introduction) {
    introduction = '';
  }
  introduction = introduction.replace(/{{query_date}}/g, formatDate(new Date(), data.language));
  introduction = introduction.replace(/{{status}}/g, data.status_label);
  return introduction;
}

const ReportDesignerPreview = (props) => {
  const classes = useStyles();
  const { data, media } = props;

  if (isEmpty(data)) {
    return (
      <Box className={[classes.box, classes.root].join(' ')}>
        <FormattedMessage
          id="reportDesigner.nothingToPreview"
          defaultMessage="Start creating your report to preview what users will see when they receive it."
        />
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      { data.use_introduction ?
        <Box className={classes.box}>
          <ParsedText text={previewIntroduction(data)} />
        </Box> : null }
      { data.use_visual_card ?
        <Box>
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
            date={formatDate(new Date(), data.language)}
          />
        </Box> : null }
      { data.use_text_message ?
        <Box className={classes.box}>
          <ParsedText text={data.text} block />
          { data.use_disclaimer ?
            <ParsedText text={data.disclaimer} block /> : null }
        </Box> : null }
    </Box>
  );
};

ReportDesignerPreview.propTypes = {
  data: PropTypes.object.isRequired,
  media: PropTypes.object.isRequired,
};

export default ReportDesignerPreview;
