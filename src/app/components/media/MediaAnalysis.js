import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { DatePicker } from '@material-ui/pickers';
import TimeBefore from '../TimeBefore';
import ConfirmDialog from '../layout/ConfirmDialog';
import { parseStringUnixTimestamp } from '../../helpers';
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

const MediaAnalysis = ({ projectMedia }) => {
  const classes = useStyles();
  const [error, setError] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [copying, setCopying] = React.useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);

  const analysis = projectMedia.last_status_obj;
  const { picture } = projectMedia;

  const getDefaultValue = (fieldName) => {
    let defaultValue = null;
    if (projectMedia.media && projectMedia.media.metadata) {
      defaultValue = projectMedia.media.metadata[fieldName];
    }
    return defaultValue;
  };

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

  const canEdit = can(projectMedia.permissions, 'update Status');

  const handleChange = (field, value) => {
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

  const canCopy = can(projectMedia.permissions, 'create Dynamic') && getValue('title') && getValue('content');
  const published = (projectMedia.report && projectMedia.report.data && projectMedia.report.data.state === 'published');

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
    const fields = propsToData(props, language);
    fields.state = 'paused';
    fields.options.forEach((option, i) => {
      if (fields.options[i].language === language) {
        fields.options[i].use_text_message = true;
        fields.options[i].headline = getValue('title').substring(0, 85);
        fields.options[i].description = getValue('content').substring(0, 240);
        fields.options[i].title = getValue('title');
        fields.options[i].text = `${getValue('content')}\n\n${getValue('published_article_url') || ''}`;
        fields.options[i].date = getValue('date_published') ? formatDate(new Date(parseInt(getValue('date_published'), 10) * 1000), language) : formatDate(new Date(), language);
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
          browserHistory.push(`${window.location.pathname}/report`);
        }
      },
      onError: () => {
        setCopying(false);
      },
    });
  };

  const handleConfirmCopyToReport = () => {
    setShowConfirmationDialog(true);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Typography variant="button" component="div">
            <FormattedMessage id="mediaAnalysis.analysis" defaultMessage="Analysis" />
          </Typography>
          <Typography variant="caption" component="div" className={classes.saved}>
            { saving ?
              <FormattedMessage
                id="mediaAnalysis.saving"
                defaultMessage="Saving..."
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
          <Button onClick={handleConfirmCopyToReport} variant="contained" color="primary" disabled={saving || copying || !canCopy}>
            { copying ?
              <FormattedMessage id="mediaAnalysis.copying" defaultMessage="Copying..." /> :
              <FormattedMessage id="mediaAnalysis.copyToReport" defaultMessage="Copy to report" /> }
          </Button>
        </Box>
      </Box>

      <Box>
        <Box display="flex" className={classes.box}>
          { picture ? <img src={picture} alt="" className={classes.image} /> : null }
          <TextField
            label={
              <FormattedMessage id="mediaAnalysis.title" defaultMessage="Title" />
            }
            defaultValue={getValue('title') || getDefaultValue('title')}
            placeholder={getDefaultValue('title')}
            variant="outlined"
            rows={3}
            onBlur={(e) => { handleChange('title', e.target.value); }}
            disabled={!canEdit}
            multiline
            fullWidth
          />
        </Box>
        <Box display="flex" className={classes.box}>
          <TextField
            label={
              <FormattedMessage id="mediaAnalysis.content" defaultMessage="Content" />
            }
            defaultValue={getValue('content') || getDefaultValue('description')}
            placeholder={getDefaultValue('description')}
            variant="outlined"
            rows={6}
            onBlur={(e) => { handleChange('content', e.target.value); }}
            disabled={!canEdit}
            multiline
            fullWidth
          />
        </Box>
        <Box display="flex" className={classes.box}>
          <TextField
            label={
              <FormattedMessage id="mediaAnalysis.publishedArticle" defaultMessage="Published article" />
            }
            defaultValue={getValue('published_article_url')}
            variant="outlined"
            onBlur={(e) => { handleChange('published_article_url', e.target.value); }}
            disabled={!canEdit}
            fullWidth
          />
        </Box>
        <Box display="flex" className={classes.box}>
          <DatePicker
            label={
              <FormattedMessage
                id="mediaAnalysis.date"
                defaultMessage="Date published"
              />
            }
            value={getValue('date_published') ? new Date(parseInt(getValue('date_published'), 10) * 1000) : new Date()}
            inputVariant="outlined"
            disabled={!canEdit}
            onChange={(date) => { handleChange('date_published', date.unix()); }}
          />
        </Box>
      </Box>
      <ConfirmDialog
        open={showConfirmationDialog}
        title={
          published ?
            <FormattedMessage
              id="mediaAnalysis.confirmTitle1"
              defaultMessage="Current report is published"
            /> :
            <FormattedMessage
              id="mediaAnalysis.confirmTitle2"
              defaultMessage="Overwrite existing report?"
            />
        }
        blurb={
          published ?
            <FormattedMessage
              id="mediaAnalysis.confirmText1"
              defaultMessage="You need to first pause your report in order to edit it. Do you want to pause the report and update it with the new content?"
            /> :
            <FormattedMessage
              id="mediaAnalysis.confirmText2"
              defaultMessage="Do you want to update the report with this new content? All edits will be lost."
            />
        }
        continueButtonLabel={
          published ?
            <FormattedMessage
              id="mediaAnalysis.confirmButtonLabel1"
              defaultMessage="Pause report and update content"
            /> :
            <FormattedMessage
              id="mediaAnalysis.confirmButtonLabel2"
              defaultMessage="Overwrite content"
            />
        }
        handleClose={handleCloseConfirmationDialog}
        handleConfirm={handleCopyToReport}
      />
    </Box>
  );
};

MediaAnalysis.propTypes = {
  projectMedia: PropTypes.object.isRequired,
};

export default MediaAnalysis;
