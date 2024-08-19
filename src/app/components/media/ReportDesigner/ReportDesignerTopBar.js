/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { browserHistory } from 'react-router';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Box from '@material-ui/core/Box';
import ReportDesignerConfirmableButton from './ReportDesignerConfirmableButton';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import MediaStatus from '../MediaStatus';
import { getStatus } from '../../../helpers';
import { languageLabel } from '../../../LanguageRegistry';
import IconArrowBack from '../../../icons/arrow_back.svg';
import IconPlay from '../../../icons/play_arrow.svg';
import IconPause from '../../../icons/pause.svg';
import HelpIcon from '../../../icons/help.svg';
import CheckPropTypes from '../../../CheckPropTypes';
import styles from './ReportDesigner.module.css';

const useStyles = makeStyles(theme => ({
  confirmation: {
    marginBottom: theme.spacing(2),
  },
  correctionLink: {
    display: 'inline-flex',
    gap: `${theme.spacing(0.5)}px`,
    color: 'var(--color-blue-54)',
    '&:visited': {
      color: 'var(--color-blue-54)',
    },
    '&:hover': {
      textDecoration: 'none',
    },
  },
}));

const ReportDesignerTopBar = (props) => {
  const classes = useStyles();

  const {
    data,
    defaultLanguage,
    intl,
    media,
    prefixUrl,
    state,
  } = props;
  const [resendToPrevious, setResendToPrevious] = React.useState(false);
  const [statusChanging, setStatusChanging] = React.useState(false);

  // By default, there is no report at all - so we can't publish, of course
  let cantPublishReason = (
    <FormattedMessage
      defaultMessage="You must have at least Report Text or Visual Card selected in order to publish the report."
      description="Report designer helper message"
      id="reportDesignerToolbar.cantPublishInitial"
    />
  );
  const defaultReport = data.options;
  // If text report and visual card are not set for the default language, can't publish (we need at least one of them)
  if (defaultReport && !defaultReport.use_visual_card && !defaultReport.use_text_message) {
    cantPublishReason = (
      <FormattedMessage
        defaultMessage="The report for {language} cannot be empty because it is the default language. You must have content in Report Text or Visual Card for {language}. Or, you can right-click on the tab for another language to make it the default language."
        description="Report designer helper message"
        id="reportDesignerToolbar.cantPublishDefault"
        values={{ language: languageLabel(defaultLanguage) }}
      />
    );
  }
  const hasLanguage = defaultReport.language?.length > 0 && defaultReport.language !== 'und';
  // We can publish if there is a default report with either visual card or text report
  const hasValidTextReport = defaultReport && hasLanguage && defaultReport.use_text_message && defaultReport.text?.length > 0 && defaultReport.title?.length > 0;
  const hasValidVisualCard = defaultReport && hasLanguage && defaultReport.use_visual_card && defaultReport.headline?.length > 0 && defaultReport.description?.length > 0;
  if (hasValidTextReport || hasValidVisualCard) {
    cantPublishReason = null;
  } else {
    cantPublishReason = (
      <FormattedMessage
        defaultMessage="You must add a title, a summary and a language to the fact-check in order to publish the report."
        description="Text with a reason why user can not publish a report"
        id="reportDesignerToolbar.cantPublishText"
      />
    );
  }
  // We can't publish if the status is the initial one
  if (media.last_status === media.team.verification_statuses.default) {
    cantPublishReason = (
      <FormattedMessage
        defaultMessage="Your item still has the default status {status} and must be changed to a different status before it can be published."
        description="Report designer helper message"
        id="reportDesignerToolbar.cantPublishStatus"
        values={{ status: <strong>{getStatus(media.team.verification_statuses, media.last_status, defaultLanguage, defaultLanguage).label}</strong> }}
      />
    );
  }
  // We Can't publish if using a visual card and there's a content warning and no alternative image is set
  if (media.show_warning_cover && defaultReport.image === media.media.picture && defaultReport.use_visual_card) {
    cantPublishReason = (
      <FormattedMessage
        defaultMessage="Your item still has a visual card with a content warning. Upload an alternative image or uncheck the visual card option."
        description="Report designer helper message"
        id="reportDesignerToolbar.cantPublishContentFlag"
      />
    );
  }

  const readOnly = props.readOnly || statusChanging;
  const statusChanged = !!(data.last_published && defaultReport &&
    defaultReport.previous_published_status_label &&
    defaultReport.status_label !== defaultReport.previous_published_status_label);
  let firstSent = data.first_published;
  if (!firstSent && data.last_published && data.published_count > 0) {
    firstSent = data.last_published;
  }
  if (firstSent) {
    firstSent = new Date(parseInt(firstSent, 10) * 1000).toLocaleString(intl.locale);
  }
  let lastSent = null;
  if (data.last_published) {
    lastSent = new Date(parseInt(data.last_published, 10) * 1000).toLocaleString(intl.locale);
  }

  const handleGoBack = () => {
    browserHistory.push(`${prefixUrl}/media/${media.dbid}`);
  };

  const handleStatusChanging = () => {
    setStatusChanging(true);
  };

  const handleStatusChanged = () => {
    setStatusChanging(false);
    props.onStatusChange();
  };

  return (
    <div className={styles['report-header-bar']}>
      <ButtonMain
        iconLeft={<IconArrowBack />}
        label={
          <FormattedMessage
            defaultMessage="Back"
            description="Button label to navigate back to item page"
            id="reportDesigner.back"
          />
        }
        size="default"
        theme="text"
        variant="text"
        onClick={handleGoBack}
      />
      <div className={styles['report-header-meta']}>
        <div className="typography-subtitle2">
          <FormattedMessage
            defaultMessage="First published"
            description="Header for first publication date of report"
            id="reportDesigner.firstSent"
          />
          <div className="typography-body1">
            {firstSent || '-'}
          </div>
        </div>
        <div className="typography-subtitle2">
          <FormattedMessage
            defaultMessage="Last published"
            description="Header for last publication date of report"
            id="reportDesigner.lastPublished"
          />
          <div className="typography-body1">
            {lastSent || firstSent || '-'}
          </div>
        </div>
        <div className="typography-subtitle2">
          <FormattedMessage
            defaultMessage="Reports sent"
            description="Header for reports sent count"
            id="reportDesigner.sentCount"
          />
          <div className="typography-body1">
            { media.dynamic_annotation_report_design ?
              media.dynamic_annotation_report_design.sent_count : 0 }
          </div>
        </div>
      </div>
      <div className={styles['report-actions']}>
        { (state === 'paused' || state === 'unpublished') ?
          <ReportDesignerConfirmableButton
            cancelLabel={
              <FormattedMessage
                defaultMessage="Go back"
                description="Cancel action button label"
                id="reportDesigner.cancelPublish"
              />
            }
            content={
              <Box>
                {/* Can't publish report */}
                { cantPublishReason ? <p>{cantPublishReason}</p> : null }
                {/* Sending report for the first time */}
                { !cantPublishReason && !data.last_published && media.demand > 0 ?
                  <FormattedMessage
                    defaultMessage="{demand, plural, one {You are about to send this report to the user who has requested this item.} other {You are about to send this report to the # users who have requested this item.}}"
                    description="Helper message to publishing report action"
                    id="reportDesigner.confirmPublishText"
                    tagName="p"
                    values={{ demand: media.demand }}
                  /> : null }

                { !cantPublishReason ?
                  <FormattedMessage
                    defaultMessage="Future users who request this item will receive this version of the report while it remains published."
                    description="Helper message to publishing report action"
                    id="reportDesigner.confirmPublishText2"
                    tagName="p"
                  /> : null }

                {/* Re-sending a report after a status change */}
                { !cantPublishReason && statusChanged && media.demand > 0 ?
                  <FormattedMessage
                    defaultMessage="{demand, plural, one {Because the status has changed, the updated report will be sent as a {correctionLink} to the user who has received the previous version of this report.} other {Because the status has changed, the updated report will be sent as a {correctionLink} to the # users who have received the previous version of this report.}}"
                    description="Helper message to publishing report action"
                    id="reportDesigner.confirmRepublishResendText"
                    tagName="p"
                    values={{
                      demand: media.demand,
                      correctionLink: (
                        <React.Fragment>
                          <a className={classes.correctionLink} href="https://help.checkmedia.org/en/articles/8772805-fact-check-reports-guide#h_ad3678e1ff" rel="noopener noreferrer" target="_blank">
                            <FormattedMessage
                              defaultMessage="correction"
                              description="This term describes a Report correction. It is used in a sentence like: 'the report will be sent as a correction'. It is detached from the main sentence as it is used inside a hyperlink"
                              id="reportDesigner.correction"
                            />
                            {' '}
                            <HelpIcon />
                          </a>
                        </React.Fragment>
                      ),
                    }}
                  /> : null }

                {/* Re-sending a report with the same status */}
                { !cantPublishReason && data.last_published && !statusChanged && media.demand > 0 ?
                  <Box className={classes.confirmation}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={resendToPrevious}
                          key="resend-report"
                          onChange={(e) => { setResendToPrevious(e.target.checked); }}
                        />
                      }
                      label={
                        media.team?.get_languages?.length > 1 && data.options?.language && data.options.language !== 'und' && media.team?.alegre_bot?.alegre_settings?.single_language_fact_checks_enabled ?
                          <FormattedMessage
                            defaultMessage="Also send this updated report only to users who requested this item in {reportLanguage}."
                            description="Helper message to publishing report action"
                            id="reportDesigner.republishAndResendSingleLanguage"
                            values={{
                              reportLanguage: languageLabel(data?.options?.language),
                            }}
                          /> :
                          <FormattedMessage
                            defaultMessage="{demand, plural, one {Also send this updated report as a {correctionLink} to the user who has received the previous version of this report.} other {Also send this updated report as a {correctionLink} to the # users who have received the previous version of this report.}}"
                            description="Helper message to publishing report correction action"
                            id="reportDesigner.republishAndResend"
                            values={{
                              demand: media.demand,
                              correctionLink: (
                                <React.Fragment>
                                  <a className={classes.correctionLink} href="https://help.checkmedia.org/en/articles/8772805-fact-check-reports-guide#h_ad3678e1ff" rel="noopener noreferrer" target="_blank">
                                    <FormattedMessage
                                      defaultMessage="correction"
                                      description="This term describes a Report correction. It is used in a sentence like: 'the report will be sent as a correction'. It is detached from the main sentence as it is used inside a hyperlink"
                                      id="reportDesigner.correction"
                                    />
                                    {' '}
                                    <HelpIcon />
                                  </a>
                                </React.Fragment>
                              ),
                            }}
                          />
                      }
                    />
                  </Box> : null }
              </Box>
            }
            disabled={readOnly}
            icon={<IconPlay />}
            label={
              <FormattedMessage
                defaultMessage="Publish"
                description="Label for publish report button"
                id="reportDesigner.publish"
              />
            }
            noCancel={Boolean(cantPublishReason)}
            proceedLabel={
              <React.Fragment>
                {/* Can't publish report */}
                { cantPublishReason ?
                  <FormattedMessage
                    defaultMessage="Go back to editing"
                    description="Back to editing action button label"
                    id="reportDesigner.cantPublish"
                  /> : null }
                {/* Sending report for the first time */}
                { !cantPublishReason && !data.last_published ?
                  <FormattedMessage
                    defaultMessage="Publish report"
                    description="Publish report action button label"
                    id="reportDesigner.confirmPublish"
                  /> : null }
                {/* Re-sending a report with the same status */}
                { !cantPublishReason && data.last_published && !statusChanged ?
                  <FormattedMessage
                    defaultMessage="Publish changes"
                    description="Publish report action button label"
                    id="reportDesigner.confirmPublishSameStatus"
                  /> : null }
                {/* Re-sending a report after a status change */}
                { !cantPublishReason && statusChanged ?
                  <FormattedMessage
                    defaultMessage="Publish changes and send correction"
                    description="Publish report action button label"
                    id="reportDesigner.confirmPublishStatusChange"
                  /> : null }
              </React.Fragment>
            }
            theme="validation"
            title={
              <React.Fragment>
                {/* Can't publish report */}
                { cantPublishReason ?
                  <FormattedMessage
                    defaultMessage="Your report is not ready to be published"
                    description="Helper message to publishing report action"
                    id="reportDesigner.cantPublishTitle"
                  /> : null }

                {/* Sending report for the first time */}
                { !cantPublishReason && !data.last_published ?
                  <FormattedMessage
                    defaultMessage="Ready to publish your report?"
                    description="Helper message to publishing report action"
                    id="reportDesigner.confirmPublishTitle"
                  /> : null }

                {/* Re-sending a report after a status change */}
                { !cantPublishReason && statusChanged ?
                  <FormattedMessage
                    defaultMessage="Ready to publish your changes?"
                    description="Helper message to publishing report action"
                    id="reportDesigner.confirmRepublishResendTitle"
                  /> : null }

                {/* Re-sending a report with the same status */}
                { !cantPublishReason && data.last_published && !statusChanged ?
                  <FormattedMessage
                    defaultMessage="Ready to publish your changes?"
                    description="Helper message to publishing report action"
                    id="reportDesigner.confirmRepublishTitle"
                  /> : null }
              </React.Fragment>
            }
            onClose={null}
            onConfirm={
              cantPublishReason ?
                null :
                () => {
                  if (data.last_published) {
                    if (statusChanged || resendToPrevious) {
                      props.onStateChange('republish_and_resend', 'published');
                    } else {
                      props.onStateChange('republish_but_not_resend', 'published');
                    }
                  } else {
                    props.onStateChange('publish', 'published');
                  }
                }
            }
          /> : null }
        { state === 'published' ?
          <ReportDesignerConfirmableButton
            cancelLabel={
              <FormattedMessage
                defaultMessage="Go back"
                description="Cancel action button label"
                id="reportDesigner.cancelPause"
              />
            }
            content={
              <FormattedMessage
                defaultMessage="This will stop the report from being sent out to users until it is published again."
                description="Pause report publication action helper text"
                id="reportDesigner.confirmPauseText"
                tagName="p"
              />
            }
            disabled={readOnly}
            icon={<IconPause />}
            label={
              <FormattedMessage
                defaultMessage="Pause"
                description="Pause report publication action button label"
                id="reportDesigner.pause"
              />
            }
            proceedLabel={
              <FormattedMessage
                defaultMessage="Pause report"
                description="Confirm pause report publication action button label"
                id="reportDesigner.confirmPause"
              />
            }
            theme="alert"
            title={
              <FormattedMessage
                defaultMessage="Do you want to pause the report?"
                description="Pause report publication dialog title"
                id="reportDesigner.confirmPauseTitle"
              />
            }
            onConfirm={() => {
              props.onStateChange('pause', 'paused');
            }}
          /> : null }
        <MediaStatus
          callback={handleStatusChanged}
          media={media}
          readonly={readOnly || state === 'published'}
          onChanging={handleStatusChanging}
        />
      </div>
    </div>
  );
};

ReportDesignerTopBar.defaultProps = {
  readOnly: false,
};

ReportDesignerTopBar.propTypes = {
  state: CheckPropTypes.reportState.isRequired,
  media: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  defaultLanguage: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onStateChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  intl: intlShape.isRequired,
  prefixUrl: PropTypes.string.isRequired,
};

export default injectIntl(ReportDesignerTopBar);
