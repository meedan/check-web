import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import { browserHistory } from 'react-router';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ReportDesignerConfirmableButton from './ReportDesignerConfirmableButton';
import MediaStatus from '../MediaStatus';
import { getStatus } from '../../../helpers';
import { languageLabel } from '../../../LanguageRegistry';
import IconArrowBack from '../../../icons/arrow_back.svg';
import IconPlay from '../../../icons/play_arrow.svg';
import IconPause from '../../../icons/pause.svg';
import HelpIcon from '../../../icons/help.svg';

const useStyles = makeStyles(theme => ({
  publish: {
    background: 'var(--validationMain)',
    color: 'var(--otherWhite)',
  },
  pause: {
    background: 'var(--alertMain)',
    color: 'var(--otherWhite)',
  },
  confirmation: {
    marginBottom: theme.spacing(2),
  },
  reportHeader: {
    backgroundColor: 'var(--brandBackground)',
    borderBottom: '1px solid var(--brandBorder)',
  },
  cell: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  correctionLink: {
    display: 'inline-flex',
    gap: `${theme.spacing(0.5)}px`,
    color: 'var(--brandMain)',
    '&:visited': {
      color: 'var(--brandMain)',
    },
    '&:hover': {
      textDecoration: 'none',
    },
  },
}));

const ReportDesignerTopBar = (props) => {
  const classes = useStyles();

  const {
    media,
    state,
    data,
    defaultLanguage,
    intl,
    prefixUrl,
  } = props;
  const [resendToPrevious, setResendToPrevious] = React.useState(false);
  const [statusChanging, setStatusChanging] = React.useState(false);

  // By default, there is no report at all - so we can't publish, of course
  let cantPublishReason = (
    <FormattedMessage
      id="reportDesignerToolbar.cantPublishInitial"
      defaultMessage="You must have at least Report Text or Visual Card selected in order to publish the report."
      description="Report designer helper message"
    />
  );
  const defaultReport = data.options;
  // If text report and visual card are not set for the default language, can't publish (we need at least one of them)
  if (defaultReport && !defaultReport.use_visual_card && !defaultReport.use_text_message) {
    cantPublishReason = (
      <FormattedMessage
        id="reportDesignerToolbar.cantPublishDefault"
        defaultMessage="The report for {language} cannot be empty because it is the default language. You must have content in Report Text or Visual Card for {language}. Or, you can right-click on the tab for another language to make it the default language."
        description="Report designer helper message"
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
        id="reportDesignerToolbar.cantPublishText"
        defaultMessage="You must add a title, a summary and a language to the fact-check in order to publish the report."
        description="Text with a reason why user can not publish a report"
      />
    );
  }
  // We can't publish if the status is the initial one
  if (media.last_status === media.team.verification_statuses.default) {
    cantPublishReason = (
      <FormattedMessage
        id="reportDesignerToolbar.cantPublishStatus"
        defaultMessage="Your item still has the default status {status} and must be changed to a different status before it can be published."
        description="Report designer helper message"
        values={{ status: <strong>{getStatus(media.team.verification_statuses, media.last_status, defaultLanguage, defaultLanguage).label}</strong> }}
      />
    );
  }
  // We Can't publish if using a visual card and there's a content warning and no alternative image is set
  if (media.show_warning_cover && defaultReport.image === media.media.picture && defaultReport.use_visual_card) {
    cantPublishReason = (
      <FormattedMessage
        id="reportDesignerToolbar.cantPublishContentFlag"
        defaultMessage="Your item still has a visual card with a content warning. Upload an alternative image or uncheck the visual card option."
        description="Report designer helper message"
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
    <Toolbar className={classes.reportHeader}>
      <Box display="flex" justifyContent="space-between" width="1">
        <Box display="flex" alignItems="center">
          <Button startIcon={<IconArrowBack />} onClick={handleGoBack}>
            <FormattedMessage
              id="reportDesigner.back"
              defaultMessage="Back to annotation"
              description="Button label to navigate back to annotation mode"
            />
          </Button>
        </Box>
        <Box display="flex" justifyContent="space-between" width="0.5">
          <Box display="flex">
            <Box className={classes.cell}>
              <Typography variant="subtitle2">
                <FormattedMessage
                  id="reportDesigner.firstSent"
                  defaultMessage="First published"
                  description="Header for first publication date of report"
                />
              </Typography>
              <Typography variant="body1">
                {firstSent || '-'}
              </Typography>
            </Box>
            <Box className={classes.cell}>
              <Typography variant="subtitle2">
                <FormattedMessage
                  id="reportDesigner.lastPublished"
                  defaultMessage="Last published"
                  description="Header for last publication date of report"
                />
              </Typography>
              <Typography variant="body1">
                {lastSent || firstSent || '-'}
              </Typography>
            </Box>
            <Box className={classes.cell}>
              <Typography variant="subtitle2">
                <FormattedMessage
                  id="reportDesigner.sentCount"
                  defaultMessage="Reports sent"
                  description="Header for reports sent count"
                />
              </Typography>
              <Typography variant="body1">
                { media.dynamic_annotation_report_design ?
                  media.dynamic_annotation_report_design.sent_count : 0 }
              </Typography>
            </Box>
          </Box>
          <Box display="flex">
            { state === 'paused' ?
              <ReportDesignerConfirmableButton
                className={classes.publish}
                disabled={readOnly}
                label={
                  <FormattedMessage
                    id="reportDesigner.publish"
                    defaultMessage="Publish"
                    description="Label for publish report button"
                  />
                }
                icon={<IconPlay />}
                title={
                  <React.Fragment>
                    {/* Can't publish report */}
                    { cantPublishReason ?
                      <FormattedMessage
                        id="reportDesigner.cantPublishTitle"
                        defaultMessage="Your report is not ready to be published"
                        description="Helper message to publishing report action"
                      /> : null }

                    {/* Sending report for the first time */}
                    { !cantPublishReason && !data.last_published ?
                      <FormattedMessage
                        id="reportDesigner.confirmPublishTitle"
                        defaultMessage="Ready to publish your report?"
                        description="Helper message to publishing report action"
                      /> : null }

                    {/* Re-sending a report after a status change */}
                    { !cantPublishReason && statusChanged ?
                      <FormattedMessage
                        id="reportDesigner.confirmRepublishResendTitle"
                        defaultMessage="Ready to publish your changes?"
                        description="Helper message to publishing report action"
                      /> : null }

                    {/* Re-sending a report with the same status */}
                    { !cantPublishReason && data.last_published && !statusChanged ?
                      <FormattedMessage
                        id="reportDesigner.confirmRepublishTitle"
                        defaultMessage="Ready to publish your changes?"
                        description="Helper message to publishing report action"
                      /> : null }
                  </React.Fragment>
                }
                content={
                  <Box>
                    {/* Can't publish report */}
                    { cantPublishReason ? <Typography>{cantPublishReason}</Typography> : null }
                    {/* Sending report for the first time */}
                    { !cantPublishReason && !data.last_published && media.demand > 0 ?
                      <Typography>
                        <FormattedMessage
                          id="reportDesigner.confirmPublishText"
                          defaultMessage="{demand, plural, one {You are about to send this report to the user who has requested this item.} other {You are about to send this report to the # users who have requested this item.}}"
                          description="Helper message to publishing report action"
                          values={{ demand: media.demand }}
                        />
                      </Typography> : null }

                    { !cantPublishReason ?
                      <Typography paragraph>
                        <FormattedMessage
                          id="reportDesigner.confirmPublishText2"
                          defaultMessage="Future users who request this item will receive this version of the report while it remains published."
                          description="Helper message to publishing report action"
                        />
                      </Typography> : null }

                    {/* Re-sending a report after a status change */}
                    { !cantPublishReason && statusChanged && media.demand > 0 ?
                      <Typography>
                        <FormattedMessage
                          id="reportDesigner.confirmRepublishResendText"
                          defaultMessage="{demand, plural, one {Because the status has changed, the updated report will be sent as a {correctionLink} to the user who has received the previous version of this report.} other {Because the status has changed, the updated report will be sent as a {correctionLink} to the # users who have received the previous version of this report.}}"
                          description="Helper message to publishing report action"
                          values={{
                            demand: media.demand,
                            correctionLink: (
                              <React.Fragment>
                                <a href="https://help.checkmedia.org/en/articles/5013901-tipline-report-confirmation-updates-and-corrections" rel="noopener noreferrer" className={classes.correctionLink} target="_blank">
                                  <FormattedMessage
                                    id="reportDesigner.correction"
                                    defaultMessage="correction"
                                    description="This term describes a Report correction. It is used in a sentence like: 'the report will be sent as a correction'. It is detached from the main sentence as it is used inside a hyperlink"
                                  />
                                  {' '}
                                  <HelpIcon />
                                </a>
                              </React.Fragment>
                            ),
                          }}
                        />
                      </Typography> : null }

                    {/* Re-sending a report with the same status */}
                    { !cantPublishReason && data.last_published && !statusChanged && media.demand > 0 ?
                      <Box className={classes.confirmation}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              key="resend-report"
                              onChange={(e) => { setResendToPrevious(e.target.checked); }}
                              checked={resendToPrevious}
                            />
                          }
                          label={
                            media.team?.get_languages?.length > 1 && data.options?.language && data.options.language !== 'und' && media.team?.alegre_bot?.alegre_settings?.single_language_fact_checks_enabled ?
                              <FormattedMessage
                                id="reportDesigner.republishAndResendSingleLanguage"
                                defaultMessage="Also send this updated report only to users who requested this item in {reportLanguage}."
                                description="Helper message to publishing report action"
                                values={{
                                  reportLanguage: languageLabel(data?.options?.language),
                                }}
                              /> :
                              <FormattedMessage
                                id="reportDesigner.republishAndResend"
                                defaultMessage="{demand, plural, one {Also send this updated report as a {correctionLink} to the user who has received the previous version of this report.} other {Also send this updated report as a {correctionLink} to the # users who have received the previous version of this report.}}"
                                description="Helper message to publishing report correction action"
                                values={{
                                  demand: media.demand,
                                  correctionLink: (
                                    <React.Fragment>
                                      <a href="https://help.checkmedia.org" rel="noopener noreferrer" className={classes.correctionLink} target="_blank">
                                        <FormattedMessage
                                          id="reportDesigner.correction"
                                          defaultMessage="correction"
                                          description="This term describes a Report correction. It is used in a sentence like: 'the report will be sent as a correction'. It is detached from the main sentence as it is used inside a hyperlink"
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
                cancelLabel={
                  <FormattedMessage
                    id="reportDesigner.cancelPublish"
                    defaultMessage="Go back"
                    description="Cancel action button label"
                  />
                }
                proceedLabel={
                  <React.Fragment>
                    {/* Can't publish report */}
                    { cantPublishReason ?
                      <FormattedMessage
                        id="reportDesigner.cantPublish"
                        defaultMessage="Go back to editing"
                        description="Back to editing action button label"
                      /> : null }
                    {/* Sending report for the first time */}
                    { !cantPublishReason && !data.last_published ?
                      <FormattedMessage
                        id="reportDesigner.confirmPublish"
                        defaultMessage="Publish report"
                        description="Publish report action button label"
                      /> : null }
                    {/* Re-sending a report with the same status */}
                    { !cantPublishReason && data.last_published && !statusChanged ?
                      <FormattedMessage
                        id="reportDesigner.confirmPublishSameStatus"
                        defaultMessage="Publish changes"
                        description="Publish report action button label"
                      /> : null }
                    {/* Re-sending a report after a status change */}
                    { !cantPublishReason && statusChanged ?
                      <FormattedMessage
                        id="reportDesigner.confirmPublishStatusChange"
                        defaultMessage="Publish changes and send correction"
                        description="Publish report action button label"
                      /> : null }
                  </React.Fragment>
                }
                noCancel={Boolean(cantPublishReason)}
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
                className={classes.pause}
                disabled={readOnly}
                label={
                  <FormattedMessage
                    id="reportDesigner.pause"
                    defaultMessage="Pause"
                    description="Pause report publication action button label"
                  />
                }
                icon={<IconPause />}
                title={
                  <FormattedMessage
                    id="reportDesigner.confirmPauseTitle"
                    defaultMessage="Do you want to pause the report?"
                    description="Pause report publication dialog title"
                  />
                }
                content={
                  <Typography>
                    <FormattedMessage
                      id="reportDesigner.confirmPauseText"
                      defaultMessage="This will stop the report from being sent out to users until it is published again."
                      description="Pause report publication action helper text"
                    />
                  </Typography>
                }
                cancelLabel={
                  <FormattedMessage
                    id="reportDesigner.cancelPause"
                    defaultMessage="Go back"
                    description="Cancel action button label"
                  />
                }
                proceedLabel={
                  <FormattedMessage
                    id="reportDesigner.confirmPause"
                    defaultMessage="Pause report"
                    description="Confirm pause report publication action button label"
                  />
                }
                onConfirm={() => {
                  props.onStateChange('pause', 'paused');
                }}
              /> : null }
            <MediaStatus
              media={media}
              readonly={readOnly || state === 'published'}
              callback={handleStatusChanged}
              onChanging={handleStatusChanging}
            />
          </Box>
        </Box>
      </Box>
    </Toolbar>
  );
};

ReportDesignerTopBar.defaultProps = {
  readOnly: false,
};

ReportDesignerTopBar.propTypes = {
  state: PropTypes.oneOf(['paused', 'published']).isRequired,
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
