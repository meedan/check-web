import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconReport from '@material-ui/icons/PlaylistAddCheck';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TimeBefore from '../TimeBefore';
import LanguagePickerDialog from '../layout/LanguagePickerDialog';
import { parseStringUnixTimestamp, truncateLength } from '../../helpers';
import { can } from '../Can';
import MediaFactCheckField from './MediaFactCheckField';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';

const useStyles = makeStyles(() => ({
  title: {
    fontSize: '16px',
  },
}));

const MediaFactCheck = ({ projectMedia }) => {
  const classes = useStyles();
  const claimDescription = projectMedia.suggested_main_item ? projectMedia.suggested_main_item.claim_description : projectMedia.claim_description;
  const factCheck = claimDescription ? claimDescription.fact_check : null;

  const [title, setTitle] = React.useState((factCheck && factCheck.title) ? factCheck.title : '');
  const [summary, setSummary] = React.useState(factCheck ? factCheck.summary : '');
  const [url, setUrl] = React.useState((factCheck && factCheck.url) ? factCheck.url : '');
  const [language, setLanguage] = React.useState(factCheck ? factCheck.language : '');
  const [saving, setSaving] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setTitle(factCheck?.title || '');
    setSummary(factCheck?.summary);
    setUrl(factCheck?.url || '');
    setLanguage(factCheck?.language || '');
  }, [factCheck?.title, factCheck?.summary, factCheck?.url, factCheck?.language]);

  const hasPermission = Boolean(can(projectMedia.permissions, 'create ClaimDescription') && claimDescription?.description);
  const published = (projectMedia.report && projectMedia.report.data && projectMedia.report.data.state === 'published');
  const readOnly = projectMedia.is_secondary || projectMedia.suggested_main_item;
  const isDisabled = Boolean(readOnly || published);

  const handleGoToReport = () => {
    if (!claimDescription || claimDescription.description?.trim()?.length === 0) {
      setShowDialog(true);
    } else {
      window.location.assign(`${window.location.pathname.replace(/\/(suggested-matches|similar-media)/, '')}/report`);
    }
  };

  const handleBlur = (field, value) => {
    setError(false);
    const values = {
      title,
      summary,
      url,
      language,
    };
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
                  language
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
                    language
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
              setLanguage(response.createFactCheck.claim_description.fact_check.language);
            }
          },
          onError: () => {
            setSaving(false);
            setError(true);
          },
        });
      } else {
        setSaving(false);
        setError(true);
      }
    }
  };

  const handleLanguageSubmit = (value) => {
    const { languageCode } = value;
    setLanguage(languageCode);
    handleBlur('language', languageCode);
  };

  return (
    <Box id="media__fact-check">
      <Box id="media__fact-check-title" display="flex" alignItems="center" mb={2} justifyContent="space-between">
        <Typography className={classes.title} variant="body1" component="div">
          <strong>
            <FormattedMessage id="mediaFactCheck.factCheck" defaultMessage="Fact-check" description="Title of the media fact-check section." />
          </strong>
        </Typography>
        {' '}
        <Typography variant="caption" component="div">
          { error ?
            <FormattedMessage
              id="mediaFactCheck.error"
              defaultMessage="Title and description have to be filled"
              description="Caption that informs that a fact-check could not be saved and that the fields have to be filled"
            /> : null }
          { saving && !error ?
            <FormattedMessage
              id="mediaFactCheck.saving"
              defaultMessage="saving…"
              description="Caption that informs that a fact-check is being saved"
            /> : null }
          { !saving && !error && factCheck ?
            <FormattedMessage
              className="media-fact-check__saved-by"
              id="mediaFactCheck.saved"
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
        hasClaimDescription={Boolean(claimDescription?.description)}
        hasPermission={hasPermission}
        disabled={isDisabled}
        rows={1}
        key={`title-${claimDescription}`}
      />

      <MediaFactCheckField
        limit={900 - title.length - url.length}
        label={<FormattedMessage id="mediaFactCheck.summary" defaultMessage="Summary" description="Label for fact-check summary field" />}
        name="summary"
        value={truncateLength(summary, 900 - title.length - url.length - 3)}
        onBlur={(newValue) => {
          setSummary(newValue);
          handleBlur('summary', newValue);
        }}
        hasClaimDescription={Boolean(claimDescription?.description)}
        hasPermission={hasPermission}
        disabled={isDisabled}
        rows={1}
        key={`summary-${claimDescription}-${title.length}-${url.length}`}
      />

      <MediaFactCheckField
        label={<FormattedMessage id="mediaFactCheck.url" defaultMessage="Article URL" description="Label for fact-check URL field" />}
        name="url"
        value={url}
        onBlur={(newValue) => {
          let newUrl = newValue;
          if (!/^https?:\/\//.test(newValue) && newValue && newValue.length > 0) {
            newUrl = `https://${newValue}`;
          }
          setUrl(newUrl);
          handleBlur('url', newUrl);
        }}
        hasClaimDescription={Boolean(claimDescription?.description)}
        hasPermission={hasPermission}
        disabled={isDisabled}
        rows={1}
        key={`url-${claimDescription}-${url}`}
      />

      <LanguagePickerDialog
        isDisabled={(!hasPermission || isDisabled)}
        selectedlanguage={language}
        onSubmit={handleLanguageSubmit}
        team={projectMedia.team}
      />

      { projectMedia.team.smooch_bot ?
        <Box mt={1}>
          <Button
            onClick={handleGoToReport}
            className="media-fact-check__report-designer"
            variant="contained"
            color="primary"
            startIcon={<IconReport />}
            disabled={saving || readOnly}
          >
            { published ?
              <FormattedMessage
                className="media-fact-check__published-report"
                id="mediaActionsBar.publishedReport"
                defaultMessage="Published report"
                description="A label on a button that opens the report for this item. This displays if the report for this media item is currently in the 'Published' state."
              /> :
              <FormattedMessage
                className="media-fact-check__unpublished-report"
                id="mediaActionsBar.unpublishedReport"
                defaultMessage="Unpublished report"
                description="A label on a button that opens the report for this item. This displays if the report for this media item is NOT currently in the 'Published' state."
              /> }
          </Button>
        </Box> : null }

      <ConfirmProceedDialog
        open={showDialog}
        title={
          <FormattedMessage
            id="mediaFactCheck.claimMissingTitle"
            defaultMessage="Claim missing"
            description="Title of a dialog that is displayed when user attempts to access a report from a fact-check but there is no claim yet"
          />
        }
        body={
          <div>
            <Typography variant="body1" component="p" paragraph>
              <FormattedMessage
                id="mediaFactCheck.claimMissingDesc"
                data-testid="media-fact-check__confirm-button-label"
                defaultMessage="You must add a claim to access the fact-check report."
                description="Content of a dialog that is displayed when user attempts to access a report from a fact-check but there is no claim yet"
              />
            </Typography>
          </div>
        }
        proceedLabel={
          <FormattedMessage
            id="mediaFactCheck.confirmButtonLabel"
            defaultMessage="Go back to editing"
            description="A label on a button that the user can press to go back to the screen where they edit a fact-check."
          />
        }
        onProceed={() => { setShowDialog(false); }}
        onCancel={() => { setShowDialog(false); }}
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
        language: PropTypes.string,
        updated_at: PropTypes.string,
        user: PropTypes.shape({
          name: PropTypes.string,
        }),
      }),
    }),
  }),
};

export default MediaFactCheck;
