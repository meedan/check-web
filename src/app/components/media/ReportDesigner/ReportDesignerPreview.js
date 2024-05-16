import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import WarningIcon from '../../../icons/report_problem.svg';
import ParsedText from '../../ParsedText';
import ReportDesignerImagePreview from './ReportDesignerImagePreview';
import { formatDate } from './reportDesignerHelpers';

const useStyles = makeStyles(theme => ({
  root: {
    margin: '0 auto',
  },
  messagePreview: {
    borderRadius: '8px',
    backgroundColor: 'var(--color-white-100)',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: 502,
    color: 'var(--color-gray-15)',
    lineHeight: '1.5em',
  },
  visualCardPreview: {
    position: 'relative',
  },
  contentScreen: {
    width: 500,
    height: 500,
    top: 0,
    padding: '64px 40px 16px 40px',
    backgroundColor: 'var(--color-gray-15)',
    zIndex: 100,
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'var(--color-white-100)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '80px',
    color: 'var(--errorMain)',
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

function previewIntroduction(data, media, defaultReport) {
  let { introduction } = data;
  if (!introduction) {
    introduction = '';
  } else {
    if (defaultReport.placeholders) {
      introduction = introduction.replace(/{{query_date}}/g, defaultReport.placeholders.query_date);
    } else {
      introduction = introduction.replace(/{{query_date}}/g, formatDate(new Date(), data.language));
    }
    introduction = introduction.replace(/{{status}}/g, data.status_label);
  }
  return introduction;
}

function previewFooter(defaultReport) {
  const footer = [];
  if (!defaultReport.use_signature) {
    return '';
  }
  if (defaultReport.signature) {
    footer.push(defaultReport.signature);
  }
  if (defaultReport.whatsapp) {
    footer.push(`WhatsApp: ${defaultReport.whatsapp}`);
  }
  if (defaultReport.facebook) {
    footer.push(`FB Messenger: m.me/${defaultReport.facebook}`);
  }
  if (defaultReport.twitter) {
    footer.push(`Twitter: twitter.com/${defaultReport.twitter}`);
  }
  if (defaultReport.telegram) {
    footer.push(`Telegram: t.me/${defaultReport.telegram.replace(/_/g, '%5F')}`);
  }
  if (defaultReport.viber) {
    footer.push(`Viber: ${defaultReport.viber}`);
  }
  if (defaultReport.line) {
    footer.push(`LINE: ${defaultReport.line}`);
  }
  if (defaultReport.instagram) {
    footer.push(`Instagram: instagram.com/${defaultReport.instagram}`);
  }
  return footer.join('\n');
}

const ReportDesignerPreview = (props) => {
  const classes = useStyles();
  const { data, media } = props;

  if (isEmpty(data)) {
    return (
      <div className={[classes.messagePreview, classes.root].join(' ')}>
        <FormattedMessage
          id="reportDesigner.nothingToPreview"
          defaultMessage="Start creating your report to preview what users will see when they receive it."
          description="Empty message when there is no preview to show"
        />
      </div>
    );
  }

  const defaultReports = media.team.get_report || {};
  const defaultReport = defaultReports[data.language] || {};

  const text = [];
  if (data.title) {
    text.push(`*${data.title}*`);
  }
  if (data.text) {
    text.push(data.text);
  }
  if (data.published_article_url) {
    text.push(data.published_article_url);
  }
  text.push(previewFooter(defaultReport));

  const introduction = previewIntroduction(data, media, defaultReport);

  const maskContent = media.show_warning_cover && media.media.picture === data.image;
  const originalMediaImage = !media.show_warning_cover ? media.media.picture : null;

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
              description="Help text to tell the user to add content to the introduction"
            />
          )}
        </Box> : null }
      { data.use_text_message ?
        <Box className={classes.messagePreview}>
          { text.length ? (
            <ParsedText text={text.join('\n\n')} truncateFileUrls={false} block />
          ) : (
            <FormattedMessage
              id="reportDesigner.addText"
              defaultMessage="Add content to the text message"
              description="Help text to tell the user to add content to the text message"
            />
          )}
        </Box> : null }
      { data.use_visual_card && !data.use_text_message ?
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
                : originalMediaImage
            }
            teamAvatar={media.team.avatar}
            params={data}
            template={media.team.get_report_design_image_template}
            date={data.date || formatDate(new Date(), data.language)}
            defaultReport={defaultReport}
          />
          { maskContent ? (
            <div className={classes.contentScreen}>
              <WarningIcon className={classes.icon} />
              <h5>
                <FormattedHTMLMessage
                  id="reportDesigner.contentScreenHeader"
                  defaultMessage="Content with warning cannot<br />be published as a visual card."
                  description="Header for visual card when there's a content warning active and no alternative image is set"
                />
              </h5>
              <FormattedHTMLMessage
                id="reportDesigner.uploadAlternative"
                defaultMessage="Upload an alternative image or<br />uncheck the visual card option."
                description="Header for visual card when there's a content warning active and no alternative image is set"
              />
              <div>
                <FormattedMessage
                  id="reportDesigner.incorrectWarning"
                  defaultMessage="Was this content warning incorrectly applied?"
                  description="Header for visual card when there's a content warning active and no alternative image is set"
                />
                <br />
                <FormattedMessage
                  id="reportDesigner.goBack"
                  defaultMessage="Go back to the annotation page and remove the content warning."
                  description="The annotation page means the page where item annotation is made (aka the item page), not the page of an annotation"
                />
              </div>
            </div>
          ) : null }
        </Box> : null }
    </Box>
  );
};

ReportDesignerPreview.propTypes = {
  data: PropTypes.object.isRequired,
  media: PropTypes.object.isRequired,
};

export default ReportDesignerPreview;
