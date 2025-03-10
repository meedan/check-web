import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import cx from 'classnames/bind';
import ReportDesignerImagePreview from './ReportDesignerImagePreview';
import { formatDate } from './reportDesignerHelpers';
import { getStatus } from '../../../helpers';
import WarningIcon from '../../../icons/report_problem.svg';
import ParsedText from '../../ParsedText';
import styles from './ReportDesigner.module.css';

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
    let status = null;
    try {
      status = getStatus(
        media.team.verification_statuses,
        media.last_status,
        data.language,
        media.team.language,
      ).label;
    } catch {
      status = data.status_label;
    }
    introduction = introduction.replace(/{{status}}/g, status);
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
  const { data, media } = props;

  if (isEmpty(data)) {
    return (
      <div className={cx(styles['message-preview'], styles['report-designer-preview'])}>
        <FormattedMessage
          defaultMessage="Start creating your report to preview what users will see when they receive it."
          description="Empty message when there is no preview to show"
          id="reportDesigner.nothingToPreview"
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
    <div className={styles['report-designer-preview']}>
      { data.use_introduction ?
        <div className={styles['message-preview']}>
          { introduction ? (
            <ParsedText text={introduction} />
          ) : (
            <FormattedMessage
              defaultMessage="Add content to the introduction"
              description="Help text to tell the user to add content to the introduction"
              id="reportDesigner.addIntro"
            />
          )}
        </div> : null }
      { data.use_text_message ?
        <div className={styles['message-preview']}>
          { text.length ? (
            <ParsedText block text={text.join('\n\n')} truncateFileUrls={false} />
          ) : (
            <FormattedMessage
              defaultMessage="Add content to the text message"
              description="Help text to tell the user to add content to the text message"
              id="reportDesigner.addText"
            />
          )}
        </div> : null }
      { data.use_visual_card && !data.use_text_message ?
        <div className={styles['visual-card-preview']}>
          <ReportDesignerImagePreview
            date={data.date || formatDate(new Date(), data.language)}
            defaultReport={defaultReport}
            image={
              data.image
                // data.image is either String (from backend) or File (from upload).
                // <ReportImagePreview> needs String.
                ? (data.image.preview || data.image)
                : originalMediaImage
            }
            params={data}
            style={{
              width: 500,
              height: 500,
            }}
            teamAvatar={media.team.avatar}
            template={media.team.get_report_design_image_template}
          />
          { maskContent ? (
            <div className={styles['content-screen']}>
              <WarningIcon className={styles['content-screen-icon']} />
              <h5>
                <FormattedHTMLMessage
                  defaultMessage="Content with warning cannot<br />be published as a visual card."
                  description="Header for visual card when there's a content warning active and no alternative image is set"
                  id="reportDesigner.contentScreenHeader"
                />
              </h5>
              <FormattedHTMLMessage
                defaultMessage="Upload an alternative image or<br />uncheck the visual card option."
                description="Header for visual card when there's a content warning active and no alternative image is set"
                id="reportDesigner.uploadAlternative"
              />
              <div>
                <FormattedMessage
                  defaultMessage="Was this content warning incorrectly applied?"
                  description="Header for visual card when there's a content warning active and no alternative image is set"
                  id="reportDesigner.incorrectWarning"
                />
                <br />
                <FormattedMessage
                  defaultMessage="Go back to the annotation page and remove the content warning."
                  description="The annotation page means the page where item annotation is made (aka the item page), not the page of an annotation"
                  id="reportDesigner.goBack"
                />
              </div>
            </div>
          ) : null }
        </div> : null }
    </div>
  );
};

ReportDesignerPreview.propTypes = {
  data: PropTypes.object.isRequired,
  media: PropTypes.object.isRequired,
};

export default createFragmentContainer(ReportDesignerPreview, {
  media: graphql`
    fragment ReportDesignerPreview_media on ProjectMedia {
      last_status
      show_warning_cover
      media {
        picture
      }
      team {
        avatar
        get_report
        get_report_design_image_template
        verification_statuses
      }
    }
  `,
});
