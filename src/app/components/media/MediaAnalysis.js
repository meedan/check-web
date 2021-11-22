import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { DatePicker } from '@material-ui/pickers';
import MediaTags from './MediaTags';
import TimeBefore from '../TimeBefore';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { parseStringUnixTimestamp } from '../../helpers';
import CheckChannels from '../../CheckChannels';
import { propsToData, formatDate } from './ReportDesigner/reportDesignerHelpers';
import { can } from '../Can';

const useStyles = makeStyles(theme => ({
  saved: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  image: {
    width: 93,
    height: 93,
    objectFit: 'cover',
    marginRight: theme.dir === 'rtl' ? 0 : theme.spacing(1),
    marginLeft: theme.dir === 'rtl' ? theme.spacing(1) : 0,
  },
  box: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const messages = defineMessages({
  import: {
    id: 'mediaAnalysis.import',
    defaultMessage: 'Import',
    description: 'Creator that refers to items created via Fetch, ZAPIER or ZAPIER',
  },
  tipline: {
    id: 'mediaAnalysis.tipline',
    defaultMessage: 'Tipline',
    description: 'Creator that refers to items created via tiplines',
  },
});

const MediaAnalysis = ({ projectMedia, onTimelineCommentOpen, intl }) => {
  const classes = useStyles();
  const [error, setError] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [copying, setCopying] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);

  const analysis = projectMedia.last_status_obj;
  const {
    picture,
    creator_name: creatorName,
    user_id: UserId,
    channel,
  } = projectMedia;

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

  const [title, setTitle] = React.useState(getValue('title'));
  const [content, setContent] = React.useState(getValue('content'));

  const handleFocus = () => {
    if (!editing) {
      setEditing(true);
    }
  };

  const handleChangeTitle = (e) => {
    setTitle(e.target.value);
  };

  const handleChangeContent = (e) => {
    setContent(e.target.value);
  };

  const canEdit = can(projectMedia.permissions, 'update Status');

  const handleChange = (field, value) => {
    setEditing(false);
    if (value !== getValue(field) && canEdit) {
      setSaving(true);
      const fields = {};
      fields[field] = value;
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation MediaAnalysisUpdateAnalysisMutation($input: UpdateDynamicInput!) {
            updateDynamic(input: $input) {
              project_media {
                last_status_obj {
                  data
                  updated_at
                }
              }
            }
          }
        `,
        variables: {
          input: {
            id: analysis.id,
            set_fields: JSON.stringify(fields),
          },
        },
        onCompleted: (response, err) => {
          setSaving(false);
          if (err) {
            setError(true);
          } else {
            setError(false);
          }
        },
        onError: () => {
          setSaving(false);
          setError(true);
        },
      });
    }
  };

  const handleCloseConfirmationDialog = () => {
    setShowConfirmationDialog(false);
  };

  const canCopy = can(projectMedia.permissions, 'create Dynamic');
  const published = (projectMedia.report && projectMedia.report.data && projectMedia.report.data.state === 'published');
  const noReport = !projectMedia.report;

  const handleCopyToReport = () => {
    setShowConfirmationDialog(false);
    setCopying(true);

    const language = projectMedia.team.get_language || 'en';
    const props = {
      media: {
        ...projectMedia,
        dynamic_annotation_report_design: projectMedia.report,
      },
    };
    const headline = getValue('title') || '';
    let description = getValue('content') || '';
    description = description.substring(0, 760);
    const fields = propsToData(props, language);
    fields.state = 'paused';
    fields.options.forEach((option, i) => {
      if (fields.options[i].language === language) {
        fields.options[i].use_text_message = true;
        fields.options[i].headline = headline.substring(0, 85);
        fields.options[i].description = description.substring(0, 240);
        fields.options[i].title = headline;
        fields.options[i].text = `${description}\n\n${getValue('published_article_url') || ''}`;
        fields.options[i].date = getValue('date_published') ? formatDate(new Date(parseInt(getValue('date_published'), 10) * 1000), language) : formatDate(new Date(), language);
        fields.options[i].image = (projectMedia.media && projectMedia.media.picture) ? projectMedia.media.picture : '';
      }
    });

    const input = {
      annotated_type: 'ProjectMedia',
      annotated_id: `${projectMedia.dbid}`,
      annotation_type: 'report_design',
      set_fields: JSON.stringify(fields),
    };
    if (projectMedia.report) {
      input.id = projectMedia.report.id;
    }

    const mutation = projectMedia.report ?
      graphql`
        mutation MediaAnalysisUpdateDynamicMutation($input: UpdateDynamicInput!) {
          updateDynamic(input: $input) {
            project_media {
              id
              dynamic_annotation_report_design {
                id
                data
              }
            }
          }
        }
      ` :
      graphql`
        mutation MediaAnalysisCreateDynamicMutation($input: CreateDynamicInput!) {
          createDynamic(input: $input) {
            dynamic {
              id
            }
          }
        }
      `;

    commitMutation(Relay.Store, {
      mutation,
      variables: { input },
      onCompleted: (response, err) => {
        setCopying(false);
        if (!err) {
          window.location.assign(`${window.location.pathname.replace(/\/(suggested-matches|similar-media)/, '')}/report`);
        }
      },
      onError: () => {
        setCopying(false);
      },
    });
  };

  const handleConfirmCopyToReport = () => {
    if (noReport) {
      handleCopyToReport();
    } else {
      setShowConfirmationDialog(true);
    }
  };

  const showUserName = [CheckChannels.MANUAL, CheckChannels.BROWSER_EXTENSION].indexOf(channel.toString()) !== -1;

  return (
    <Box>
      <Box my={2}>
        <Typography variant="body" component="div">
          <FormattedMessage
            id="mediaAnalysis.createdBy"
            defaultMessage="Item created by {name}"
            values={{
              name: showUserName ? <a href={`/check/user/${UserId}`}> {creatorName} </a> : intl.formatMessage(messages[creatorName.toLocaleLowerCase()]),
            }}
          />
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Typography variant="body" component="div">
            <strong>
              <FormattedMessage id="mediaAnalysis.analysis" defaultMessage="Analysis" />
            </strong>
          </Typography>
          <Typography variant="caption" component="div" className={classes.saved}>
            { saving ?
              <FormattedMessage
                id="mediaAnalysis.saving"
                defaultMessage="Saving…"
              /> : null }
            { !saving && !error ?
              <FormattedMessage
                id="mediaAnalysis.saved"
                defaultMessage="Saved {ago}"
                values={{
                  ago: <TimeBefore date={parseStringUnixTimestamp(analysis.updated_at)} />,
                }}
              /> : null }
            { !saving && error ?
              <FormattedMessage
                id="mediaAnalysis.error"
                defaultMessage="Could not save! Last save {ago}"
                values={{
                  ago: <TimeBefore date={parseStringUnixTimestamp(analysis.updated_at)} />,
                }}
              /> : null }
          </Typography>
        </Box>
        <Box>
          <Button onClick={handleConfirmCopyToReport} className="media-analysis__copy-to-report" variant="contained" color="primary" disabled={saving || copying || !canCopy || editing}>
            { copying ?
              <FormattedMessage id="mediaAnalysis.copying" defaultMessage="Copying…" /> :
              <FormattedMessage id="mediaAnalysis.copyToReport" defaultMessage="Copy to report" /> }
          </Button>
        </Box>
      </Box>

      <Box>
        <Box display="flex" className={classes.box}>
          { picture ? <img src={picture} alt="" className={classes.image} onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }} /> : null }
          <TextField
            label={
              <FormattedMessage id="mediaAnalysis.title" defaultMessage="Title" />
            }
            value={title}
            variant="outlined"
            rows={3}
            onBlur={(e) => { handleChange('title', e.target.value); }}
            onFocus={handleFocus}
            onChange={handleChangeTitle}
            disabled={!canEdit}
            className="media-analysis__title"
            multiline
            fullWidth
          />
        </Box>
        <Box display="flex" className={classes.box}>
          <TextField
            label={
              <FormattedMessage
                id="mediaAnalysis.content"
                defaultMessage="Content"
              />
            }
            value={content}
            variant="outlined"
            rows={12}
            onBlur={(e) => { handleChange('content', e.target.value); }}
            onFocus={handleFocus}
            onChange={handleChangeContent}
            disabled={!canEdit}
            className="media-analysis__content"
            multiline
            fullWidth
          />
        </Box>
        <Box display="flex" className={classes.box}>
          <TextField
            label={
              <FormattedMessage id="mediaAnalysis.publishedArticle" defaultMessage="Published article URL" />
            }
            defaultValue={getValue('published_article_url')}
            variant="outlined"
            onBlur={(e) => { handleChange('published_article_url', e.target.value); }}
            onFocus={handleFocus}
            disabled={!canEdit}
            fullWidth
          />
        </Box>
        <Box display="flex" className={classes.box}>
          <DatePicker
            label={
              <FormattedMessage
                id="mediaAnalysis.date"
                defaultMessage="Published article date"
              />
            }
            value={getValue('date_published') ? new Date(parseInt(getValue('date_published'), 10) * 1000) : null}
            inputVariant="outlined"
            disabled={!canEdit}
            format="MMMM DD, YYYY"
            onChange={(date) => { handleChange('date_published', date.unix()); }}
            fullWidth
          />
        </Box>
        <MediaTags
          projectMedia={projectMedia}
          onTimelineCommentOpen={onTimelineCommentOpen}
        />
      </Box>
      <ConfirmProceedDialog
        open={showConfirmationDialog}
        title={
          published ?
            <FormattedMessage
              id="mediaAnalysis.confirmTitle1"
              defaultMessage="Current report is published"
            /> :
            <FormattedMessage
              id="mediaAnalysis.confirmTitle2"
              defaultMessage="Overwrite existing report content?"
            />
        }
        body={
          <div>
            <Typography variant="body1" component="p" paragraph>
              { published ?
                <FormattedMessage
                  id="mediaAnalysis.confirmText1"
                  defaultMessage="You need to first pause your report in order to edit it. Do you want to pause the report and update it with the new content?"
                /> :
                <FormattedMessage
                  id="mediaAnalysis.confirmText2"
                  defaultMessage="Do you want to update the report with this new content? All content currently in the report will be lost."
                />
              }
            </Typography>
          </div>
        }
        proceedLabel={
          published ?
            <FormattedMessage
              id="mediaAnalysis.confirmButtonLabel1"
              defaultMessage="Pause report and update content"
            /> :
            <FormattedMessage
              id="mediaAnalysis.confirmButtonLabel2"
              defaultMessage="Overwrite report content"
            />
        }
        onProceed={handleCopyToReport}
        onCancel={handleCloseConfirmationDialog}
      />
    </Box>
  );
};

MediaAnalysis.propTypes = {
  projectMedia: PropTypes.object.isRequired,
  onTimelineCommentOpen: PropTypes.func.isRequired,
};

export default injectIntl(MediaAnalysis);
