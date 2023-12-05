import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import IconReport from '../../icons/fact_check.svg';
import IconUnpublishedReport from '../../icons/unpublished_report.svg';
import TimeBefore from '../TimeBefore';
import LanguagePickerSelect from '../cds/inputs/LanguagePickerSelect';
import { parseStringUnixTimestamp, truncateLength, safelyParseJSON } from '../../helpers';
import { can } from '../Can';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import TextArea from '../cds/inputs/TextArea';
import TextField from '../cds/inputs/TextField';
import Alert from '../cds/alerts-and-prompts/Alert';
import styles from './media.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

const MediaFactCheck = ({ projectMedia }) => {
  const claimDescription = projectMedia.suggested_main_item ? projectMedia.suggested_main_item.claim_description : projectMedia.claim_description;
  const factCheck = claimDescription ? claimDescription.fact_check : null;
  const { team } = projectMedia;
  const languages = safelyParseJSON(team.get_languages) || ['en'];
  const defaultFactCheckLanguage = languages && languages.length === 1 ? languages[0] : null;

  const [title, setTitle] = React.useState((factCheck && factCheck.title) ? factCheck.title : '');
  const [summary, setSummary] = React.useState(factCheck ? factCheck.summary : '');
  const [url, setUrl] = React.useState((factCheck && factCheck.url) ? factCheck.url : '');
  const [language, setLanguage] = React.useState(factCheck ? factCheck.language : defaultFactCheckLanguage);
  const [saving, setSaving] = React.useState(false);

  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setTitle(factCheck?.title || '');
    setSummary(factCheck?.summary);
    setUrl(factCheck?.url || '');
    setLanguage(factCheck?.language || defaultFactCheckLanguage);
  }, [factCheck?.title, factCheck?.summary, factCheck?.url, factCheck?.language]);

  const hasPermission = Boolean(can(projectMedia.permissions, 'create ClaimDescription') && claimDescription?.description);
  const published = (projectMedia.report && projectMedia.report.data && projectMedia.report.data.state === 'published');
  const readOnly = projectMedia.is_secondary || projectMedia.suggested_main_item;
  const isDisabled = Boolean(readOnly || published);
  const claimDescriptionMissing = !claimDescription || claimDescription.description?.trim()?.length === 0;

  const handleGoToReport = () => {
    window.location.assign(`${window.location.pathname.replace(/\/(suggested-matches|similar-media)/, '')}/report`);
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
    <div className={inputStyles['form-inner-wrapper']}>
      <div id="media__fact-check" className={inputStyles['form-fieldset']}>
        { claimDescriptionMissing ?
          <Alert
            className={styles['media-item-claim-alert']}
            variant="info"
            contained
            title={
              <FormattedMessage
                id="alert.noClaimTitle"
                defaultMessage="Claim Required"
                description="Alert box information title to tell the user they must complete additional fields to unlock this area"
              />
            }
            content={
              <FormattedMessage
                id="alert.noClaimDescript"
                defaultMessage="Add a claim above in order to access the fact-check for this item"
                description="Alert box information content to tell the user they must complete additional fields to unlock this area"
              />
            }
          />
          : null
        }
        <div id="media__fact-check-title" className={inputStyles['form-fieldset-title']}>
          <FormattedMessage id="mediaFactCheck.factCheck" defaultMessage="Fact-check" description="Title of the media fact-check section." />
          <div className={inputStyles['form-fieldset-title-extra']}>
            { saving ?
              <FormattedMessage
                id="mediaFactCheck.saving"
                defaultMessage="saving…"
                description="Caption that informs that a fact-check is being saved"
              /> : null }
            { !saving && factCheck ?
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
          </div>
        </div>
        <div className={inputStyles['form-fieldset-field']}>
          <FormattedMessage
            id="mediaFactCheck.titlePlaceholder"
            defaultMessage="Objective message to readers"
            description="Placeholder instructions for fact-check title field"
          >
            { placeholder => (
              <TextArea
                defaultValue={title}
                componentProps={{
                  id: 'media-fact-check__title',
                }}
                className="media-fact-check__title"
                name="title"
                required
                rows="1"
                helpContent={error ? <FormattedMessage id="mediaFactCheck.errorTitle" defaultMessage="Fact-check title is required" description="Caption that informs that a fact-check could not be saved and that the title field has to be filled" /> : null}
                error={error}
                autoGrow
                maxHeight="266px"
                placeholder={placeholder}
                label={<FormattedMessage id="mediaFactCheck.title" defaultMessage="Title" description="Label for fact-check title field" />}
                key={`media-fact-check__title-${claimDescription?.description ? '-with-claim' : '-no-claim'}`}
                disabled={(!hasPermission || isDisabled)}
                onBlur={(e) => {
                  const newValue = e.target.value;
                  setTitle(newValue);
                  handleBlur('title', newValue);
                }}
              />
            )}
          </FormattedMessage>
        </div>
        <div className={inputStyles['form-fieldset-field']}>
          <FormattedMessage
            id="mediaFactCheck.summaryPlaceholder"
            defaultMessage="Briefly contextualize the fact-check rating"
            description="Placeholder instructions for fact-check summary field"
          >
            { placeholder => (
              <LimitedTextArea
                required
                value={truncateLength(summary, 900 - title.length - url.length - 3)}
                componentProps={{
                  id: 'media-fact-check__summary',
                }}
                className="media-fact-check__summary"
                key={`media-fact-check__summary-${claimDescription?.description ? '-with-claim' : '-no-claim'}`}
                name="summary"
                maxChars={900 - title.length - url.length}
                rows="1"
                label={<FormattedMessage id="mediaFactCheck.summary" defaultMessage="Summary" description="Label for fact-check summary field" />}
                helpContent={error ? <FormattedMessage id="mediaFactCheck.errorSummary" defaultMessage="Fact-check summary is required" description="Caption that informs that a fact-check could not be saved and that the summary field has to be filled" /> : null}
                error={error}
                autoGrow
                placeholder={placeholder}
                disabled={(!hasPermission || isDisabled)}
                onBlur={(e) => {
                  const newValue = e.target.value;
                  setSummary(newValue);
                  handleBlur('summary', newValue);
                }}
              />
            )}
          </FormattedMessage>
        </div>
        <div className={inputStyles['form-fieldset-field']}>
          <FormattedMessage
            id="mediaFactCheck.urlPlaceholder"
            defaultMessage="Add a URL to this fact-check article"
            description="Placeholder instructions for fact-check URL field"
          >
            { placeholder => (
              <TextField
                label={<FormattedMessage id="mediaFactCheck.url" defaultMessage="Article URL" description="Label for fact-check URL field" />}
                placeholder={placeholder}
                defaultValue={url}
                componentProps={{
                  id: 'media-fact-check__url',
                }}
                className="media-fact-check__url"
                disabled={(!hasPermission || isDisabled)}
                key={`media-fact-check__url-${claimDescription?.description ? '-with-claim' : '-no-claim'}`}
                onBlur={(e) => {
                  const newValue = e.target.value;
                  let newUrl = newValue;
                  if (!/^https?:\/\//.test(newValue) && newValue && newValue.length > 0) {
                    newUrl = `https://${newValue}`;
                  }
                  setUrl(newUrl);
                  handleBlur('url', newUrl);
                }}
              />
            )}
          </FormattedMessage>
        </div>
        { languages.length > 1 ?
          <div className={inputStyles['form-fieldset-field']}>
            <LanguagePickerSelect
              label={<FormattedMessage id="mediaFactCheck.selectLanguageLabel" defaultMessage="Language" description="Label for input to select language" />}
              isDisabled={(!hasPermission || isDisabled)}
              selectedLanguage={language}
              onSubmit={handleLanguageSubmit}
              languages={safelyParseJSON(team.get_languages)}
            />
          </div> : null
        }

        { projectMedia.team.smooch_bot ?
          <div className={inputStyles['form-fieldset-field']}>
            <ButtonMain
              onClick={handleGoToReport}
              className="media-fact-check__report-designer"
              variant="contained"
              theme={published ? 'brand' : 'alert'}
              size="default"
              iconLeft={published ? <IconReport /> : <IconUnpublishedReport />}
              disabled={saving || readOnly || claimDescriptionMissing}
              label={published ?
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
                />
              }
            />
          </div> : null }
      </div>
    </div>
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
