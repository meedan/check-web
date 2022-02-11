/* eslint-disable @calm/react-intl/missing-attribute */
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
import IconArrowBack from '@material-ui/icons/ArrowBack';
import IconPlay from '@material-ui/icons/PlayArrow';
import IconPause from '@material-ui/icons/Pause';
import HelpIcon from '@material-ui/icons/HelpOutline';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import ReportDesignerCopyToClipboard from './ReportDesignerCopyToClipboard';
import ReportDesignerConfirmableButton from './ReportDesignerConfirmableButton';
import ReportDesignerEditButton from './ReportDesignerEditButton';
import MediaStatus from '../MediaStatus';
import { completedGreen, inProgressYellow, brandSecondary, checkBlue } from '../../../styles/js/shared';
import { getStatus } from '../../../helpers';
import { languageLabel } from '../../../LanguageRegistry';

const useStyles = makeStyles(theme => ({
  publish: {
    background: completedGreen,
    color: 'white',
  },
  pause: {
    background: inProgressYellow,
    color: 'white',
  },
  confirmation: {
    marginBottom: theme.spacing(2),
  },
  reportHeader: {
    backgroundColor: brandSecondary,
  },
  cell: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  correctionLink: {
    display: 'inline-flex',
    gap: `${theme.spacing(0.5)}px`,
    color: checkBlue,
    '&:visited': {
      color: checkBlue,
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
    editing,
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
    />
  );
  const defaultReport = data.options.find(r => r.language === defaultLanguage);
  // If text report and visual card are not set for the default language, can't publish (we need at least one of them)
  if (defaultReport && !defaultReport.use_visual_card && !defaultReport.use_text_message) {
    cantPublishReason = (
      <FormattedMessage
        id="reportDesignerToolbar.cantPublishDefault"
        defaultMessage="The report for {language} cannot be empty because it is the default language. You must have content in Report Text or Visual Card for {language}. Or, you can right-click on the tab for another language to make it the default language."
        values={{ language: languageLabel(defaultLanguage) }}
      />
    );
  }
  // If the text report is selected but has no content, we can't publish
  if (defaultReport && defaultReport.use_text_message &&
    defaultReport.text.length === 0 && defaultReport.title.length === 0) {
    cantPublishReason = (
      <FormattedMessage
        id="reportDesignerToolbar.cantPublishText"
        defaultMessage="You must provide text in the content or title of Report Text, or unselect it and select Visual Card in order to publish the item."
      />
    );
  }
  // We can publish if there is a default report with either visual card or non-empty text report
  const hasValidTextReport = defaultReport && defaultReport.use_text_message && (defaultReport.text.length > 0 || defaultReport.title.length > 0);
  const noInvalidTextReport = (defaultReport && !defaultReport.use_text_message) || hasValidTextReport;
  if (defaultReport && ((defaultReport.use_visual_card && noInvalidTextReport) ||
                        (!defaultReport.use_visual_card && hasValidTextReport))) {
    cantPublishReason = null;
  }
  // We can't publish if the status is the initial one
  if (media.last_status === media.team.verification_statuses.default) {
    cantPublishReason = (
      <FormattedMessage
        id="reportDesignerToolbar.cantPublishStatus"
        defaultMessage="Your item still has the default status {status} and must be changed to a different status before it can be published."
        values={{ status: <strong>{getStatus(media.team.verification_statuses, media.last_status, defaultLanguage, defaultLanguage).label}</strong> }}
      />
    );
  }
  // We Can't publish if using a visual card and there's a content warning and no alternative image is set
  if (media.show_warning_cover && media.media.picture === data.options[0].image) {
    cantPublishReason = (
      <FormattedMessage
        id="reportDesignerToolbar.cantPublishContentFlag"
        defaultMessage="Your item still has a visual card with a content warning. Upload an alternative image or uncheck the visual card option."
      />
    );
  }

  const readOnly = props.readOnly || statusChanging;
  const url = window.location.href.replace(/\/report$/, `?t=${new Date().getTime()}`);
  const embedTag = `<script src="${config.penderUrl}/api/medias.js?url=${encodeURIComponent(url)}"></script>`;
  const metadata = JSON.parse(media.oembed_metadata);
  const shareUrl = metadata.embed_url;
  const statusChanged = !!(data.last_published && data.options && data.options.length &&
    data.options[0].previous_published_status_label &&
    data.options[0].status_label !== data.options[0].previous_published_status_label);
  let firstSent = data.first_published;
  if (!firstSent && data.last_published && data.published_count > 0) {
    firstSent = data.last_published;
  }
  if (firstSent) {
    firstSent = new Date(parseInt(firstSent, 10) * 1000).toLocaleDateString(intl.locale, { month: 'short', year: 'numeric', day: '2-digit' });
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
        <Box>
          <Button startIcon={<IconArrowBack />} onClick={handleGoBack}>
            <FormattedMessage
              id="reportDesigner.back"
              defaultMessage="Back to annotation"
            />
          </Button>
          <ReportDesignerCopyToClipboard
            className="report-designer__copy-embed-code"
            value={embedTag}
            label={
              <FormattedMessage
                id="reportDesigner.copyEmbedCode"
                defaultMessage="Copy embed code"
              />
            }
          />
          <ReportDesignerCopyToClipboard
            className="report-designer__copy-share-url"
            value={shareUrl}
            label={
              <FormattedMessage
                id="reportDesigner.copyShareUrl"
                defaultMessage="Copy share URL"
              />
            }
          />
        </Box>
        <Box display="flex" justifyContent="space-between" width="0.5">
          <Box display="flex">
            <Box className={classes.cell}>
              <Typography variant="subtitle2">
                <FormattedMessage
                  id="reportDesigner.firstSent"
                  defaultMessage="First published"
                />
              </Typography>
              <Typography variant="body2">
                {firstSent || '-'}
              </Typography>
            </Box>
            <Box className={classes.cell}>
              <Typography variant="subtitle2">
                <FormattedMessage
                  id="reportDesigner.sentCount"
                  defaultMessage="Reports sent"
                />
              </Typography>
              <Typography variant="body2">
                { media.dynamic_annotation_report_design ?
                  media.dynamic_annotation_report_design.sent_count : 0 }
              </Typography>
            </Box>
          </Box>
          <Box display="flex">
            { editing ?
              <ReportDesignerEditButton
                disabled={readOnly}
                onClick={props.onSave}
                label={
                  <FormattedMessage
                    id="reportDesigner.save"
                    defaultMessage="Save"
                  />
                }
              /> :
              <ReportDesignerEditButton
                disabled={readOnly || state === 'published'}
                onClick={props.onEdit}
                label={
                  <FormattedMessage
                    id="reportDesigner.edit"
                    defaultMessage="Edit"
                  />
                }
              /> }
            { !editing && state === 'paused' ?
              <ReportDesignerConfirmableButton
                className={classes.publish}
                disabled={readOnly}
                label={
                  <FormattedMessage
                    id="reportDesigner.publish"
                    defaultMessage="Publish"
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
                      /> : null }

                    {/* Sending report for the first time */}
                    { !cantPublishReason && !data.last_published ?
                      <FormattedMessage
                        id="reportDesigner.confirmPublishTitle"
                        defaultMessage="Ready to publish your report?"
                      /> : null }

                    {/* Re-sending a report after a status change */}
                    { !cantPublishReason && statusChanged ?
                      <FormattedMessage
                        id="reportDesigner.confirmRepublishResendTitle"
                        defaultMessage="Ready to publish your changes?"
                      /> : null }

                    {/* Re-sending a report with the same status */}
                    { !cantPublishReason && data.last_published && !statusChanged ?
                      <FormattedMessage
                        id="reportDesigner.confirmRepublishTitle"
                        defaultMessage="Ready to publish your changes?"
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
                          values={{ demand: media.demand }}
                        />
                      </Typography> : null }

                    { !cantPublishReason ?
                      <Typography paragraph>
                        <FormattedMessage
                          id="reportDesigner.confirmPublishText2"
                          defaultMessage="All future users who request this item will receive this version of the report while it remains published."
                        />
                      </Typography> : null }

                    {/* Re-sending a report after a status change */}
                    { !cantPublishReason && statusChanged && media.demand > 0 ?
                      <Typography>
                        <FormattedMessage
                          id="reportDesigner.confirmRepublishResendText"
                          defaultMessage="{demand, plural, one {Because the status has changed, the updated report will be sent as a {correctionLink} to the user who has received the previous version of this report.} other {Because the status has changed, the updated report will be sent as a {correctionLink} to the # users who have received the previous version of this report.}}"
                          values={{
                            demand: media.demand,
                            correctionLink: (
                              <React.Fragment>
                                <a href="https://help.checkmedia.org/en/articles/5013901-tipline-report-confirmation-updates-and-corrections" rel="noopener noreferrer" className={classes.correctionLink} target="_blank">
                                  <FormattedMessage
                                    id="reportDesigner.correction"
                                    defaultMessage="correction"
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
                            <FormattedMessage
                              id="reportDesigner.republishAndResend"
                              defaultMessage="{demand, plural, one {Also send this updated report as a {correctionLink} to the user who has received the previous version of this report.} other {Also send this updated report as a {correctionLink} to the # users who have received the previous version of this report.}}"
                              values={{
                                demand: media.demand,
                                correctionLink: (
                                  <React.Fragment>
                                    <a href="https://help.checkmedia.org" rel="noopener noreferrer" className={classes.correctionLink} target="_blank">
                                      <FormattedMessage
                                        id="reportDesigner.correction"
                                        defaultMessage="correction"
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
                  />
                }
                proceedLabel={
                  <React.Fragment>
                    {/* Can't publish report */}
                    { cantPublishReason ?
                      <FormattedMessage
                        id="reportDesigner.cantPublish"
                        defaultMessage="Go back to editing"
                      /> : null }
                    {/* Sending report for the first time */}
                    { !cantPublishReason && !data.last_published ?
                      <FormattedMessage
                        id="reportDesigner.confirmPublish"
                        defaultMessage="Publish report"
                      /> : null }
                    {/* Re-sending a report with the same status */}
                    { !cantPublishReason && data.last_published && !statusChanged ?
                      <FormattedMessage
                        id="reportDesigner.confirmPublishSameStatus"
                        defaultMessage="Publish changes"
                      /> : null }
                    {/* Re-sending a report after a status change */}
                    { !cantPublishReason && statusChanged ?
                      <FormattedMessage
                        id="reportDesigner.confirmPublishStatusChange"
                        defaultMessage="Publish changes and send correction"
                      /> : null }
                  </React.Fragment>
                }
                noCancel={Boolean(cantPublishReason)}
                onClose={cantPublishReason ? props.onEdit : null}
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
            { !editing && state === 'published' ?
              <ReportDesignerConfirmableButton
                className={classes.pause}
                disabled={readOnly}
                label={
                  <FormattedMessage
                    id="reportDesigner.pause"
                    defaultMessage="Pause"
                  />
                }
                icon={<IconPause />}
                title={
                  <FormattedMessage
                    id="reportDesigner.confirmPauseTitle"
                    defaultMessage="Do you want to pause the report?"
                  />
                }
                content={
                  <Typography>
                    <FormattedMessage
                      id="reportDesigner.confirmPauseText"
                      defaultMessage="This will stop the report from being sent out to users until it is published again."
                    />
                  </Typography>
                }
                cancelLabel={
                  <FormattedMessage
                    id="reportDesigner.cancelPause"
                    defaultMessage="Go back"
                  />
                }
                proceedLabel={
                  <FormattedMessage
                    id="reportDesigner.confirmPause"
                    defaultMessage="Pause report"
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
  editing: PropTypes.bool.isRequired,
  media: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  defaultLanguage: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onStateChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  intl: intlShape.isRequired,
  prefixUrl: PropTypes.string.isRequired,
};

export default injectIntl(ReportDesignerTopBar);
