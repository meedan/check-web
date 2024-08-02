import React, { useEffect } from 'react';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, FormattedDate } from 'react-intl';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import Slideout from '../cds/slideout/Slideout';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import IconReport from '../../icons/fact_check.svg';
import IconUnpublishedReport from '../../icons/unpublished_report.svg';
import TagList from '../cds/menus-lists-dialogs/TagList';
import TextArea from '../cds/inputs/TextArea';
import TextField from '../cds/inputs/TextField';
import LanguagePickerSelect from '../cds/inputs/LanguagePickerSelect';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import inputStyles from '../../styles/css/inputs.module.css';
import { safelyParseJSON, truncateLength } from '../../helpers';
import styles from './ArticleForm.module.css';
import RatingSelector from '../cds/inputs/RatingSelector';
import Alert from '../cds/alerts-and-prompts/Alert.js';

const ArticleForm = ({
  saving,
  handleSave,
  onClose,
  handleBlur,
  articleType,
  mode,
  article,
  team,
}) => {
  const title = (
    <>
      {articleType === 'explainer' && mode === 'create' && <FormattedMessage id="article-form-explainer-create-title" defaultMessage="Create Explainer Article" description="Title for the slideout create explainer form" />}
      {articleType === 'explainer' && mode === 'edit' && <FormattedMessage id="article-form-explainer-edit-title" defaultMessage="Edit Explainer Article" description="Title for the slideout edit explainer form" />}
      {articleType === 'fact-check' && mode === 'create' && <FormattedMessage id="article-form-fact-check-create-title" defaultMessage="Create New Claim & Fact-Check Article" description="Title for the slideout create fact-check form" />}
      {articleType === 'fact-check' && mode === 'edit' && <FormattedMessage id="article-form-fact-check-edit-title" defaultMessage="Edit Claim & Fact-Check Article" description="Title for the slideout edit fact-check form" />}
    </>
  );

  const [claimDescription, setClaimDescription] = React.useState(article.claim_description?.description || '');
  const [claimContext, setClaimContext] = React.useState(article.claim_description?.context || '');
  const options = team?.tag_texts?.edges.map(edge => ({ label: edge.node.text, value: edge.node.text }));

  const languages = safelyParseJSON(team.get_languages) || ['en'];
  const defaultArticleLanguage = languages && languages.length === 1 ? languages[0] : null;
  const [articleTitle, setArticleTitle] = React.useState(article.title || '');
  const [summary, setSummary] = React.useState(article.summary || article.description || '');
  const [url, setUrl] = React.useState(article.url || '');
  const [language, setLanguage] = React.useState(article.language || null);
  const [tags, setTags] = React.useState(article.tags || []);
  const [status, setStatus] = React.useState(article.claim_description?.project_media?.status || article.rating || '');
  const claimDescriptionMissing = !claimDescription || claimDescription.description?.trim()?.length === 0;
  const statuses = team.verification_statuses || null;

  const [summaryError, setSummaryError] = React.useState(false);
  const [titleError, setTitleError] = React.useState(false);
  const [claimDescriptionError, setClaimDescriptionError] = React.useState(false);

  const [isValid, setIsValid] = React.useState(false);

  const isPublished = article.report_status === 'published';
  const readOnly = isPublished;
  const publishedAt = isPublished ? article.updated_at : null;
  const isStatusLocked = article.claim_description?.project_media?.last_status_obj?.locked || false;

  React.useEffect(() => {
    setLanguage(language || defaultArticleLanguage);
  }, [language]);

  useEffect(() => {
    if (articleType === 'explainer' && articleTitle?.length && summary?.length && language?.length) {
      setIsValid(true);
    } else if (articleType === 'fact-check' && articleTitle?.length && summary?.length && language?.length) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [articleTitle, summary, claimDescription, language]);

  const handleGoToReport = (projectMediaDbid) => {
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    // FIXME: use browserHistory.push instead of window.location.assign
    window.location.assign(`/${teamSlug}/media/${projectMediaDbid}/report`);
  };

  const handleLanguageSubmit = (value) => {
    const { languageCode } = value;
    setLanguage(languageCode);
    handleBlur('language', languageCode);
  };

  const handleTagChange = (newTags) => {
    setTags(newTags);
    handleBlur('tags', newTags);
  };

  const handleStatusChange = (clickedStatus) => {
    setStatus(clickedStatus);
    handleBlur('rating', clickedStatus);
  };

  return (
    <Slideout
      title={title}
      content={
        <>
          <div className={styles['article-form-container']}>
            { mode === 'edit' &&
              <div className={styles['article-form-info']}>
                <div className={styles['article-form-info-labels']}>
                  { article.updated_at &&
                    <div className="typography-subtitle2">
                      <FormattedMessage
                        id="articleForm.editedByLabel"
                        defaultMessage="Edited by:"
                        description="Label to convey when the item was last edited"
                      />
                    </div>
                  }
                  { publishedAt && articleType === 'fact-check' &&
                    <div className="typography-subtitle2">
                      <FormattedMessage
                        id="articleForm.publishedAtDate"
                        defaultMessage="Last Published:"
                        description="Label to convey when the item was last published"
                      />
                    </div>
                  }
                </div>
                <div className={styles['article-form-info-content']}>
                  { article.updated_at &&
                    <div className="typography-body2">
                      {article.user.name}, <FormattedDate value={new Date(article.updated_at * 1000)} year="numeric" month="long" day="numeric" />
                    </div>
                  }
                  { publishedAt && articleType === 'fact-check' &&
                    <div className="typography-body2">
                      <FormattedDate value={new Date(publishedAt * 1000)} year="numeric" month="long" day="numeric" />
                    </div>
                  }
                </div>
              </div>
            }
            <div className={inputStyles['form-inner-wrapper']}>
              <div className={styles['article-rating-wrapper']}>
                { articleType === 'fact-check' && statuses &&
                  <RatingSelector
                    disabled={isPublished || isStatusLocked}
                    status={status}
                    statuses={statuses}
                    onStatusChange={handleStatusChange}
                  />
                }
                { articleType === 'fact-check' &&
                  <div className={inputStyles['form-fieldset-field']}>
                    <Tooltip
                      arrow
                      title={
                        article.claim_description?.project_media?.dbid ?
                          null :
                          <FormattedMessage id="articleForm.reportDesignerTooltip" defaultMessage="Assign this Fact Check to a media item to be able to edit and publish a report" description="Tooltip for the report designer button" />
                      }
                    >
                      <span>
                        <ButtonMain
                          onClick={() => handleGoToReport(article.claim_description.project_media.dbid)}
                          className="media-fact-check__report-designer"
                          variant="contained"
                          theme={isPublished ? 'brand' : 'alert'}
                          size="default"
                          iconLeft={isPublished ? <IconReport /> : <IconUnpublishedReport />}
                          disabled={claimDescriptionMissing || !article.claim_description?.project_media?.dbid}
                          label={isPublished ?
                            <FormattedMessage
                              className="media-fact-check__published-report"
                              id="articleForm.publishedReport"
                              defaultMessage="Published report"
                              description="A label on a button that opens the report for this item. This displays if the report for this media item is currently in the 'Published' state."
                            /> :
                            <FormattedMessage
                              className="media-fact-check__unpublished-report"
                              id="articleForm.unpublishedReport"
                              defaultMessage="Unpublished report"
                              description="A label on a button that opens the report for this item. This displays if the report for this media item is NOT currently in the 'Published' state."
                            />
                          }
                        />
                      </span>
                    </Tooltip>
                  </div>
                }
              </div>
              <div id="article_form_tags" className={inputStyles['form-fieldset']}>
                <TagList
                  tags={tags}
                  setTags={handleTagChange}
                  options={options}
                />
              </div>
            </div>
          </div>
          { articleType === 'fact-check' &&
            <div className={styles['article-form-container']}>
              <div className={inputStyles['form-inner-wrapper']}>
                <div id="article-form" className={inputStyles['form-fieldset']}>
                  <div id="article-form-title" className={inputStyles['form-fieldset-title']}>
                    <FormattedMessage id="articleForm.claim" defaultMessage="Claim" description="Title of the claim section." />
                  </div>
                  <div className={inputStyles['form-fieldset-field']}>
                    <FormattedMessage
                      id="articleFormDescription.placeholder"
                      defaultMessage="For example: The earth is flat"
                      description="Placeholder for claim description field."
                    >
                      { placeholder => (
                        <TextArea
                          required
                          maxHeight="266px"
                          id="article-form__description"
                          className="article-form__description"
                          placeholder={placeholder}
                          defaultValue={claimDescription || ''}
                          error={claimDescriptionError}
                          onBlur={(e) => {
                            const newValue = e.target.value;
                            if (newValue.length) {
                              setClaimDescriptionError(false);
                              setClaimDescription(newValue);
                              handleBlur('claim description', newValue);
                            } else {
                              setClaimDescriptionError(true);
                            }
                          }}
                          label={
                            <FormattedMessage
                              id="articleForm.claimTitle"
                              defaultMessage="Title"
                              description="Title for the text input for claim title"
                            />
                          }
                        />
                      )}
                    </FormattedMessage>
                  </div>
                  <div className={inputStyles['form-fieldset-field']}>
                    <FormattedMessage
                      id="articleForm.contextPlaceholder"
                      defaultMessage="Add claim context"
                      description="Placeholder for claim context field."
                    >
                      { placeholder => (
                        <TextArea
                          autoGrow
                          maxHeight="266px"
                          id="article-form__context"
                          className="article-form__context"
                          label={
                            <FormattedMessage
                              id="articleForm.contextTitle"
                              defaultMessage="Additional context"
                              description="Title of claim additional context field."
                            />
                          }
                          placeholder={placeholder}
                          defaultValue={claimDescription ? claimContext : ''}
                          onBlur={(e) => {
                            const newValue = e.target.value;
                            setClaimContext(newValue);
                            handleBlur('claim context', newValue);
                          }}
                          rows="1"
                        />
                      )}
                    </FormattedMessage>
                  </div>
                </div>
              </div>
            </div>
          }
          <div className={styles['article-form-container']}>
            { claimDescriptionMissing && articleType === 'fact-check' ?
              <div className={styles['article-form-no-claim-container']}>
                <FormattedHTMLMessage
                  id="articleForm.noClaimDescript"
                  defaultMessage="Start by adding Claim information<br />for this Fact-Check"
                  description="Message overlay to tell the user they must complete additional fields to unlock this area"
                />
              </div>
              : null
            }
            <div className={inputStyles['form-inner-wrapper']}>
              <div id="article-form" className={inputStyles['form-fieldset']}>
                { articleType === 'fact-check' &&
                  <div id="media__fact-check-title" className={inputStyles['form-fieldset-title']}>
                    <FormattedMessage id="mediaFactCheck.factCheck" defaultMessage="Fact-check" description="Title of the media fact-check section." />
                  </div>
                }
                { articleType === 'fact-check' && isPublished && (
                  <Alert
                    icon
                    contained
                    variant="success"
                    title={<FormattedMessage id="articleForm.reportPublishedTitle" defaultMessage="Report is published" description="Title of alert box in article form." />}
                    content={<FormattedMessage id="articleForm.reportPublishedBody" defaultMessage="To make edits, pause this report. This will stop the report from being sent out to users until it is published again" description="Text of alert box in article form." />}
                    buttonLabel={<FormattedMessage id="articleForm.reportPublishedLabel" defaultMessage="Update Report" description="Label of alert button in article form." />}
                    onButtonClick={() => handleGoToReport(article.claim_description?.project_media?.dbid)}
                    className={styles['article-form-alert']}
                  />
                )}
                <div className={inputStyles['form-fieldset-field']}>
                  { articleType === 'explainer' ?
                    <FormattedMessage
                      id="articleForm.explainerTitleInputPlaceholder"
                      defaultMessage="A descriptive title for this explainer article"
                      description="Placeholder instructions for article title field"
                    >
                      { placeholder => (<TextArea
                        defaultValue={articleTitle}
                        componentProps={{
                          id: 'article-form__title',
                        }}
                        className="article-form__title"
                        name="title"
                        required
                        rows="1"
                        autoGrow
                        maxHeight="266px"
                        error={titleError}
                        placeholder={placeholder}
                        label={<FormattedMessage id="articleForm.explainerTitle" defaultMessage="Title" description="Label for explainer title field" />}
                        onBlur={(e) => {
                          const newValue = e.target.value;
                          if (newValue.length) {
                            setTitleError(false);
                            setArticleTitle(newValue);
                            handleBlur('title', newValue);
                          } else {
                            setTitleError(true);
                          }
                        }}
                      />)}
                    </FormattedMessage> :
                    <FormattedMessage
                      id="articleForm.factCheckTitleInputPlaceholder"
                      defaultMessage="A descriptive title for this fact-check article"
                      description="Placeholder instructions for article title field"
                    >
                      { placeholder => (<TextArea
                        defaultValue={articleTitle}
                        componentProps={{
                          id: 'article-form__title',
                        }}
                        className="article-form__title"
                        name="title"
                        required
                        rows="1"
                        autoGrow
                        maxHeight="266px"
                        error={titleError}
                        placeholder={placeholder}
                        label={<FormattedMessage id="articleForm.factCheckTitle" defaultMessage="Title" description="Label for fact-check title field" />}
                        disabled={readOnly}
                        onBlur={(e) => {
                          const newValue = e.target.value;
                          if (newValue.length) {
                            setTitleError(false);
                            setArticleTitle(newValue);
                            handleBlur('title', newValue);
                          } else {
                            setTitleError(true);
                          }
                        }}
                      />)}
                    </FormattedMessage>}
                </div>
                <div className={inputStyles['form-fieldset-field']}>
                  {articleType === 'explainer' ?
                    <FormattedMessage
                      id="articleForm.explainerSummaryPlaceholder"
                      defaultMessage="Briefly contextualize the narrative of this explainer"
                      description="Placeholder instructions for explainer summary field"
                    >
                      { placeholder => (
                        <LimitedTextArea
                          required
                          value={truncateLength(summary, 900 - articleTitle.length - url.length - 3)}
                          componentProps={{
                            id: 'article-form__summary',
                          }}
                          className="article-form__summary"
                          name="summary"
                          maxChars={900 - articleTitle.length - url.length}
                          rows="1"
                          label={<FormattedMessage id="articleForm.explainerSummary" defaultMessage="Summary" description="Label for article summary field" />}
                          error={summaryError}
                          autoGrow
                          placeholder={placeholder}
                          onBlur={(e) => {
                            const newValue = e.target.value;
                            if (newValue.length) {
                              setSummaryError(false);
                              setSummary(newValue);
                              handleBlur('description', newValue);
                            } else {
                              setSummaryError(true);
                            }
                          }}
                        />
                      )}
                    </FormattedMessage> :
                    <FormattedMessage
                      id="articleForm.factCheckSummaryPlaceholder"
                      defaultMessage="Briefly contextualize the narrative of this fact-check"
                      description="Placeholder instructions for fact-check summary field"
                    >
                      { placeholder => (
                        <LimitedTextArea
                          required
                          value={truncateLength(summary, 900 - articleTitle.length - url.length - 3)}
                          componentProps={{
                            id: 'article-form__summary',
                          }}
                          className="article-form__summary"
                          key={`article-form__summary-${claimDescription?.description ? '-with-claim' : '-no-claim'}`}
                          name="summary"
                          maxChars={900 - articleTitle.length - url.length}
                          rows="1"
                          label={<FormattedMessage id="articleForm.summary" defaultMessage="Summary" description="Label for article summary field" />}
                          autoGrow
                          error={summaryError}
                          placeholder={placeholder}
                          disabled={readOnly}
                          onBlur={(e) => {
                            const newValue = e.target.value;
                            if (newValue.length) {
                              setSummaryError(false);
                              setSummary(newValue);
                              handleBlur('summary', newValue);
                            } else {
                              setSummaryError(true);
                            }
                          }}
                        />
                      )}
                    </FormattedMessage>
                  }
                </div>
                <div className={inputStyles['form-fieldset-field']}>
                  {articleType === 'explainer' ?
                    <FormattedMessage
                      id="articleForm.explainerUrlPlaceholder"
                      defaultMessage="Add a URL to this explainer article"
                      description="Placeholder instructions for URL field"
                    >
                      { placeholder => (
                        <TextField
                          label={<FormattedMessage id="articleForm.explainerUrl" defaultMessage="Article URL" description="Label for article URL field" />}
                          placeholder={placeholder}
                          defaultValue={url}
                          componentProps={{
                            id: 'article-form__url',
                          }}
                          className="article-form__url"
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
                    </FormattedMessage> :
                    <FormattedMessage
                      id="articleForm.factCheckUrlPlaceholder"
                      defaultMessage="Add a URL to this fact-check article"
                      description="Placeholder instructions for URL field"
                    >
                      { placeholder => (
                        <TextField
                          label={<FormattedMessage id="articleForm.factCheckUrl" defaultMessage="Article URL" description="Label for article URL field" />}
                          placeholder={placeholder}
                          defaultValue={url}
                          componentProps={{
                            id: 'article-form__url',
                          }}
                          className="article-form__url"
                          key={`article-form__url-${claimDescription?.description ? '-with-claim' : '-no-claim'}`}
                          disabled={readOnly}
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
                  }
                </div>
                { languages.length > 1 ?
                  <div className={inputStyles['form-fieldset-field']}>
                    <LanguagePickerSelect
                      label={<FormattedMessage id="articleForm.selectLanguageLabel" defaultMessage="Language" description="Label for input to select language" />}
                      selectedLanguage={language}
                      onSubmit={handleLanguageSubmit}
                      languages={languages}
                      isDisabled={readOnly}
                      required
                    />
                  </div> : null
                }
              </div>
            </div>
          </div>
        </>
      }
      onClose={onClose}
      footer={mode === 'create'} // just here until trash is added
      showCancel={mode === 'create'}
      mainActionButton={mode === 'create' ? <ButtonMain
        onClick={handleSave}
        buttonProps={{
          id: 'article-form__save-button',
        }}
        disabled={!isValid || saving}
        label={<FormattedMessage id="articleForm.formSaveButton" defaultMessage="Create content" description="the save button for the article forom" />}
      /> : null}
    />
  );
};

ArticleForm.defaultProps = {
  saving: false,
  handleSave: null,
  article: {},
};

ArticleForm.propTypes = {
  saving: PropTypes.bool,
  handleSave: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  articleType: PropTypes.oneOf(['fact-check', 'explainer']).isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  article: PropTypes.object, // FIXME: Describe the structure
  team: PropTypes.object.isRequired,
};

export default createFragmentContainer(ArticleForm, graphql`
  fragment ArticleForm_team on Team {
    verification_statuses
    get_languages
    tag_texts(first: 100) {
      edges {
        node {
          text
        }
      }
    }
  }
  fragment ArticleForm_article on Node {
    ... on FactCheck {
      title
      summary
      url
      language
      tags
      rating
      report_status
      updated_at
      user {
        name
      }
      claim_description {
        description
        context
        project_media {
          dbid
          last_status_obj {
            locked
          }
        }
      }
    }
    ... on Explainer {
      title
      description
      url
      language
      tags
      updated_at
      user {
        name
      }
    }
  }
`);
