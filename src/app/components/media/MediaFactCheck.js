import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TimeBefore from '../TimeBefore';
import { parseStringUnixTimestamp } from '../../helpers';
import { can } from '../Can';
import { propsToData } from './ReportDesigner/reportDesignerHelpers';
import MediaFactCheckField from './MediaFactCheckField';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';

const MediaFactCheck = ({ projectMedia }) => {
  const claimDescription = projectMedia.claim_description;
  const factCheck = claimDescription ? claimDescription.fact_check : null;

  const [title, setTitle] = React.useState(factCheck ? factCheck.title : '');
  const [summary, setSummary] = React.useState(factCheck ? factCheck.summary : '');
  const [url, setUrl] = React.useState(factCheck ? factCheck.url : '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [copying, setCopying] = React.useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);

  const hasPermission = can(projectMedia.permissions, 'create ClaimDescription') && claimDescription;
  const canCopy = can(projectMedia.permissions, 'create Dynamic');
  const noReport = !projectMedia.report;
  const published = (projectMedia.report && projectMedia.report.data && projectMedia.report.data.state === 'published');
  const readOnly = projectMedia.is_secondary;

  const handleCloseConfirmationDialog = () => {
    setShowConfirmationDialog(false);
  };

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
    const headline = title || '';
    let description = summary || '';
    description = description.substring(0, 760);
    const fields = propsToData(props, language);
    fields.state = 'paused';
    fields.options.forEach((option, i) => {
      if (fields.options[i].language === language) {
        fields.options[i].use_text_message = true;
        fields.options[i].use_visual_card = false;
        fields.options[i].headline = headline.substring(0, 85);
        fields.options[i].description = description.substring(0, 240);
        fields.options[i].title = headline;
        fields.options[i].text = `${description}\n\n${url || ''}`;
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
        mutation MediaFactCheckUpdateDynamicMutation($input: UpdateDynamicInput!) {
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
        mutation MediaFactCheckCreateDynamicMutation($input: CreateDynamicInput!) {
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

  const handleBlur = (field, value) => {
    setError(false);
    const values = { title, summary, url };
    values[field] = value;
    if (hasPermission) {
      if (factCheck) {
        setSaving(true);
        commitMutation(Relay.Store, {
          mutation: graphql`
            mutation MediaFactCheckUpdateFactCheckMutation($input: UpdateFactCheckInput!) {
              updateFactCheck(input: $input) {
                fact_check {
                  id
                  updated_at
                  title
                  summary
                  url
                  user {
                    name
                  }
                }
              }
            }
          `,
          variables: {
            input: {
              id: factCheck.id,
              ...values,
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
      } else if (values.title && values.summary) {
        setSaving(true);
        commitMutation(Relay.Store, {
          mutation: graphql`
            mutation MediaFactCheckCreateFactCheckMutation($input: CreateFactCheckInput!) {
              createFactCheck(input: $input) {
                claim_description {
                  id
                  dbid
                  fact_check {
                    id
                    title
                    summary
                    url
                    updated_at
                    user {
                      name
                    }
                  }
                }
              }
            }
          `,
          variables: {
            input: {
              claim_description_id: claimDescription.dbid,
              ...values,
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
    }
  };

  return (
    <Box id="media__fact-check">
      <Box id="media__fact-check-title" display="flex" alignItems="center" mb={2} justifyContent="space-between">
        <Typography variant="body" component="div">
          <strong>
            <FormattedMessage id="mediaFactCheck.factCheck" defaultMessage="Fact-check" description="Title of the media fact-check section." />
          </strong>
        </Typography>
        {' '}
        <Typography variant="caption" component="div">
          { error ?
            <FormattedMessage
              id="mediaFactCheck,error"
              defaultMessage="error"
              description="Caption that informs that a fact-check could not be saved"
            /> : null }
          { saving && !error ?
            <FormattedMessage
              id="mediaFactCheck.saving"
              defaultMessage="saving…"
              description="Caption that informs that a fact-check is being saved"
            /> : null }
          { !saving && !error && factCheck ?
            <FormattedMessage
              id="mediaFactCheck,saved"
              defaultMessage="saved by {userName} {timeAgo}"
              values={{
                userName: factCheck.user.name,
                timeAgo: <TimeBefore date={parseStringUnixTimestamp(factCheck.updated_at)} />,
              }}
              description="Caption that informs who last saved this fact-check and when it happened."
            /> : null }
          { !saving && !factCheck && !error ? <span>&nbsp;</span> : null }
        </Typography>
      </Box>

      <MediaFactCheckField
        label={<FormattedMessage id="mediaFactCheck.title" defaultMessage="Title" description="Label for fact-check title field" />}
        name="title"
        value={title}
        onBlur={(newValue) => {
          setTitle(newValue);
          handleBlur('title', newValue);
        }}
        hasClaimDescription={Boolean(claimDescription)}
        hasPermission={hasPermission}
        disabled={readOnly}
        rows={1}
        multiline
      />

      <MediaFactCheckField
        label={<FormattedMessage id="mediaFactCheck.summary" defaultMessage="Summary" description="Label for fact-check summary field" />}
        name="summary"
        value={summary}
        onBlur={(newValue) => {
          setSummary(newValue);
          handleBlur('summary', newValue);
        }}
        hasClaimDescription={Boolean(claimDescription)}
        hasPermission={hasPermission}
        disabled={readOnly}
        multiline
      />

      <MediaFactCheckField
        label={<FormattedMessage id="mediaFactCheck.url" defaultMessage="Published article URL" description="Label for fact-check URL field" />}
        name="url"
        value={url}
        onBlur={(newValue) => {
          setUrl(newValue);
          handleBlur('url', newValue);
        }}
        hasClaimDescription={Boolean(claimDescription)}
        hasPermission={hasPermission}
        disabled={readOnly}
      />

      { projectMedia.team.smooch_bot ?
        <Box mt={1}>
          <Button onClick={handleConfirmCopyToReport} className="media-fact-check__copy-to-report" variant="contained" color="primary" disabled={saving || copying || !canCopy || !factCheck || readOnly}>
            { copying ?
              <FormattedMessage id="mediaFactCheck.copying" defaultMessage="Copying…" description="Caption displayed while fact-check data is being copied to a report." /> :
              <FormattedMessage id="mediaFactCheck.copyToReport" defaultMessage="Copy to tipline report" description="Button label to copy fact-check data into a report." /> }
          </Button>
        </Box> : null }

      <ConfirmProceedDialog
        open={showConfirmationDialog}
        title={
          published ?
            <FormattedMessage
              id="mediaFactCheck.confirmTitle1"
              defaultMessage="Current report is published"
            /> :
            <FormattedMessage
              id="mediaFactCheck.confirmTitle2"
              defaultMessage="Overwrite existing report content?"
            />
        }
        body={
          <div>
            <Typography variant="body1" component="p" paragraph>
              { published ?
                <FormattedMessage
                  id="mediaFactCheck.confirmText1"
                  defaultMessage="You need to first pause your report in order to edit it. Do you want to pause the report and update it with the new content?"
                /> :
                <FormattedMessage
                  id="mediaFactCheck.confirmText2"
                  defaultMessage="Do you want to update the report with this new content? All content currently in the report will be lost."
                />
              }
            </Typography>
          </div>
        }
        proceedLabel={
          published ?
            <FormattedMessage
              id="mediaFactCheck.confirmButtonLabel1"
              defaultMessage="Pause report and update content"
            /> :
            <FormattedMessage
              id="mediaFactCheck.confirmButtonLabel2"
              defaultMessage="Overwrite report content"
            />
        }
        onProceed={handleCopyToReport}
        onCancel={handleCloseConfirmationDialog}
      />
    </Box>
  );
};

MediaFactCheck.defaultProps = {
  projectMedia: {
    claim_description: null,
    team: { smooch_bot: null },
  },
};

MediaFactCheck.propTypes = {
  projectMedia: PropTypes.shape({
    permissions: PropTypes.string,
    is_secondary: PropTypes.bool,
    team: PropTypes.shape({
      smooch_bot: PropTypes.object,
    }),
    claim_description: PropTypes.shape({
      dbid: PropTypes.number,
      fact_check: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        summary: PropTypes.string,
        url: PropTypes.string,
        updated_at: PropTypes.string,
        user: PropTypes.shape({
          name: PropTypes.string,
        }),
      }),
    }),
  }),
};

export default MediaFactCheck;
