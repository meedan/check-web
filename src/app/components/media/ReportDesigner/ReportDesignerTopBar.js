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
import config from 'config'; // eslint-disable-line require-path-exists/exists
import ReportDesignerCopyToClipboard from './ReportDesignerCopyToClipboard';
import ReportDesignerConfirmableButton from './ReportDesignerConfirmableButton';
import ReportDesignerEditButton from './ReportDesignerEditButton';
import MediaStatus from '../MediaStatus';
import { completedGreen, inProgressYellow, brandSecondary } from '../../../styles/js/shared';

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
}));

const ReportDesignerTopBar = (props) => {
  const classes = useStyles();

  const {
    media,
    state,
    editing,
    data,
    intl,
  } = props;

  const [resendToPrevious, setResendToPrevious] = React.useState(false);
  const [statusChanging, setStatusChanging] = React.useState(false);

  const readOnly = props.readOnly || statusChanging;
  const url = window.location.href.replace(/\/report$/, `?t=${new Date().getTime()}`);
  const embedTag = `<script src="${config.penderUrl}/api/medias.js?url=${encodeURIComponent(url)}"></script>`;
  const metadata = JSON.parse(media.oembed_metadata);
  const itemUrl = metadata.permalink.replace(/^https?:\/\/[^/]+/, '');
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
    browserHistory.push(itemUrl);
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
                disabled={readOnly || !props.canPublish}
                label={
                  <FormattedMessage
                    id="reportDesigner.publish"
                    defaultMessage="Publish"
                  />
                }
                icon={<IconPlay />}
                tooltip={
                  props.canPublish ?
                    <FormattedMessage
                      id="reportDesigner.canPublish"
                      defaultMessage="Publish report"
                    /> :
                    <FormattedMessage
                      id="reportDesigner.cannotPublish"
                      defaultMessage="Fill in at least the report text or image to publish your report. Make sure to create a report for the primary language ({language})."
                      values={{
                        language: props.defaultLanguage,
                      }}
                    />
                }
                title={
                  <React.Fragment>
                    {/* Sending report for the first time */}
                    { !data.last_published ?
                      <FormattedMessage
                        id="reportDesigner.confirmPublishTitle"
                        defaultMessage="Ready to publish your report?"
                      /> : null }

                    {/* Re-sending a report after a status change */}
                    { statusChanged ?
                      <FormattedMessage
                        id="reportDesigner.confirmRepublishResendTitle"
                        defaultMessage="Ready to publish your correction?"
                      /> : null }

                    {/* Re-sending a report with the same status */}
                    { data.last_published && !statusChanged ?
                      <FormattedMessage
                        id="reportDesigner.confirmRepublishTitle"
                        defaultMessage="Ready to publish your changes?"
                      /> : null }
                  </React.Fragment>
                }
                content={
                  <Box>
                    {/* Sending report for the first time */}
                    { !data.last_published && media.demand > 0 ?
                      <Typography>
                        <FormattedMessage
                          id="reportDesigner.confirmPublishText"
                          defaultMessage="{demand, plural, one {You are about to send this report to the user who requested this item.} other {You are about to send this report to the # users who requested this item.}}"
                          values={{ demand: media.demand }}
                        />
                      </Typography> : null }

                    {/* Re-sending a report after a status change */}
                    { statusChanged && media.demand > 0 ?
                      <Typography>
                        <FormattedMessage
                          id="reportDesigner.confirmRepublishResendText"
                          defaultMessage="{demand, plural, one {Your correction will be sent to the user who has received the previous report.} other {Your correction will be sent to the # users who have received the previous report.}}"
                          values={{ demand: media.demand }}
                        />
                      </Typography> : null }

                    {/* Re-sending a report with the same status */}
                    { data.last_published && !statusChanged && media.demand > 0 ?
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
                              defaultMessage="{demand, plural, one {Also send correction to the user who already received the previous version of this report} other {Also send correction to the # users who already received the previous version of this report}}"
                              values={{ demand: media.demand }}
                            />
                          }
                        />
                      </Box> : null }

                    <Typography>
                      <FormattedMessage
                        id="reportDesigner.confirmPublishText2"
                        defaultMessage="In the future, users who request this item will receive your report while it remains published."
                      />
                    </Typography>
                  </Box>
                }
                onConfirm={() => {
                  if (data.last_published) {
                    if (statusChanged || resendToPrevious) {
                      props.onStateChange('republish_and_resend', 'published');
                    } else {
                      props.onStateChange('republish_but_not_resend', 'published');
                    }
                  } else {
                    props.onStateChange('publish', 'published');
                  }
                }}
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
                tooltip={
                  <FormattedMessage
                    id="reportDesigner.pauseReport"
                    defaultMessage="Pause report"
                  />
                }
                title={
                  <FormattedMessage
                    id="reportDesigner.confirmPauseTitle"
                    defaultMessage="You are about to pause the report"
                  />
                }
                content={
                  <Typography>
                    <FormattedMessage
                      id="reportDesigner.confirmPauseText"
                      defaultMessage="This report will not be sent to users until it is published again. Do you want to continue?"
                    />
                  </Typography>
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
  canPublish: PropTypes.bool.isRequired,
  media: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  defaultLanguage: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onStateChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(ReportDesignerTopBar);
