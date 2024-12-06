import React, { useEffect } from 'react';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage, FormattedHTMLMessage, FormattedDate } from 'react-intl';
import ArticleTrash from './ArticleTrash.js';
import TagList from '../cds/menus-lists-dialogs/TagList.js';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import Slideout from '../cds/slideout/Slideout';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import IconReport from '../../icons/fact_check.svg';
import IconUnpublishedReport from '../../icons/unpublished_report.svg';
import ErrorIcon from '../../icons/error.svg';
import TextArea from '../cds/inputs/TextArea';
import TextField from '../cds/inputs/TextField';
import LanguagePickerSelect from '../cds/inputs/LanguagePickerSelect';
import inputStyles from '../../styles/css/inputs.module.css';
import { safelyParseJSON, truncateLength, isFactCheckValueBlank } from '../../helpers';
import RatingSelector from '../cds/inputs/RatingSelector';
import Alert from '../cds/alerts-and-prompts/Alert.js';
import ExternalLink from '../ExternalLink';
import styles from './ArticleForm.module.css';

const ArticleForm = ({
  article,
  articleType,
  createFromMediaPage,
  handleBlur,
  handleSave,
  mode,
  onClose,
  saving,
  team,
}) => {
  const title = (
    <>
      {articleType === 'explainer' && mode === 'create' && <FormattedMessage defaultMessage="Create Explainer Article" description="Title for the slideout create explainer form" id="article-form-explainer-create-title" />}
      {articleType === 'explainer' && mode === 'edit' && <FormattedMessage defaultMessage="Edit Explainer Article" description="Title for the slideout edit explainer form" id="article-form-explainer-edit-title" />}
      {articleType === 'fact-check' && mode === 'create' && <FormattedMessage defaultMessage="Create New Claim & Fact-Check Article" description="Title for the slideout create fact-check form" id="article-form-fact-check-create-title" />}
      {articleType === 'fact-check' && mode === 'edit' && <FormattedMessage defaultMessage="Edit Claim & Fact-Check Article" description="Title for the slideout edit fact-check form" id="article-form-fact-check-edit-title" />}
    </>
  );

  const [claimDescription, setClaimDescription] = React.useState(article.claim_description?.description || '');
  const [claimContext, setClaimContext] = React.useState(article.claim_description?.context || '');

  const languages = safelyParseJSON(team.get_languages) || ['en'];
  const defaultArticleLanguage = team.get_language || 'en';
  const [articleTitle, setArticleTitle] = React.useState(article.title || '');
  const [summary, setSummary] = React.useState(article.summary || article.description || '');
  const [url, setUrl] = React.useState(article.url || '');
  const [language, setLanguage] = React.useState(article.language || defaultArticleLanguage);
  const [tags, setTags] = React.useState(article.tags || []);
  const [status, setStatus] = React.useState(article.claim_description?.project_media?.status || article.rating || '');
  const claimDescriptionMissing = !claimDescription || claimDescription.description?.trim()?.length === 0;
  const statuses = team.verification_statuses || null;

  const [summaryError, setSummaryError] = React.useState(false);
  const [titleError, setTitleError] = React.useState(false);
  const [claimDescriptionError, setClaimDescriptionError] = React.useState(false);

  const [isValid, setIsValid] = React.useState(false);
  const [canPublish, setCanPublish] = React.useState(false);
  const createAndPublish = createFromMediaPage && canPublish;

  const isPublished = article.report_status === 'published';
  const readOnly = isPublished;
  const publishedAt = isPublished ? article.updated_at : null;
  const isStatusLocked = article.claim_description?.project_media?.last_status_obj?.locked || false;
  const factCheckFieldsMissing = (articleType === 'fact-check' && (isFactCheckValueBlank(articleTitle) || isFactCheckValueBlank(summary) || !language));

  const maxCount = articleType === 'explainer' ? 4096 : 900;
  const [charCount, setCharCount] = React.useState(summary.length + url.length + articleTitle.length);
  const [charCountError, setCharCountError] = React.useState(charCount > maxCount);
  const maxCountErrorMessage = <FormattedMessage defaultMessage="Character Limit Reached" description="Error message for when the character limit is reached" id="articleForm.characterLimitReached" />;

  React.useEffect(() => {
    setLanguage(language || defaultArticleLanguage);
  }, [language]);

  useEffect(() => {
    if (articleType === 'explainer' && articleTitle?.length && summary?.length && language?.length) {
      setIsValid(true);
    } else if (articleType === 'fact-check' && claimDescription) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
    if (articleType === 'fact-check' && claimDescription && articleTitle && summary && language) {
      setCanPublish(true);
    } else if (articleType === 'fact-check') {
      setCanPublish(false);
    }
  }, [articleTitle, summary, claimDescription, language]);

  React.useEffect(() => {
    const count = summary.length + url.length + articleTitle.length;
    setCharCount(count);
    if (count > maxCount) {
      setCharCountError(true);
    } else {
      setCharCountError(false);
    }
  }, [articleTitle, summary, url]);

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

  const mainActionButtonLabelExplainer = (
    <FormattedMessage
      defaultMessage="Create Article"
      description="Button that saves the form data as a new article"
      id="articleForm.saveArticleButton"
    />
  );

  const secondaryActionButtonLabelFactCheck = (
    <FormattedMessage
      defaultMessage="Create Unpublished"
      description="Button that saves the form data as a new fact-check article, without proceeding to publish it"
      id="articleForm.saveUnpublishedButton"
    />
  );

  const mainActionButtonLabelFactCheck = createAndPublish ? (
    <FormattedMessage
      defaultMessage="Create & Publish"
      description="Button that saves the form data as a new fact-check article and redirects to publish report page"
      id="articleForm.saveAndPublishButton"
    />
  ) : secondaryActionButtonLabelFactCheck;

  const mainActionButtonLabel = articleType === 'explainer' ? mainActionButtonLabelExplainer : mainActionButtonLabelFactCheck;

  return (
    <Slideout
      content={
        <>
          <div className={styles['article-form-container']}>
            { mode === 'edit' &&
              <div className={styles['article-form-info']}>
                <div className={styles['article-form-info-labels']}>
                  { article.updated_at &&
                    <div className="typography-subtitle2">
                      <FormattedMessage
                        defaultMessage="Edited by:"
                        description="Label to convey when the item was last edited"
                        id="articleForm.editedByLabel"
                      />
                    </div>
                  }
                  { publishedAt && articleType === 'fact-check' &&
                    <div className="typography-subtitle2">
                      <FormattedMessage
                        defaultMessage="Last Published:"
                        description="Label to convey when the item was last published"
                        id="articleForm.publishedAtDate"
                      />
                    </div>
                  }
                  { articleType === 'fact-check' && article.claim_description?.project_media && article.claim_description?.project_media?.type !== 'Blank' &&
                    <div className="typography-subtitle2">
                      <FormattedMessage
                        defaultMessage="Media Cluster:"
                        description="Label for the link to the media cluster that this fact-check is applied to."
                        id="articleForm.mediaCluster"
                      />
                    </div>
                  }
                </div>
                <div className={styles['article-form-info-content']}>
                  { article.updated_at &&
                    <div className="typography-body2">
                      {article.user.name}, <FormattedDate day="numeric" month="long" value={new Date(article.updated_at * 1000)} year="numeric" />
                    </div>
                  }
                  { publishedAt && articleType === 'fact-check' &&
                    <div className="typography-body2">
                      <FormattedDate day="numeric" month="long" value={new Date(publishedAt * 1000)} year="numeric" />
                    </div>
                  }
                  { articleType === 'fact-check' && article.claim_description?.project_media && article.claim_description?.project_media?.type !== 'Blank' &&
                    <div className="typography-body2">
                      <ExternalLink maxUrlLength={50} title={article.claim_description?.project_media.title} url={article.claim_description?.project_media.full_url} />
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
                        <>
                          {!article.claim_description?.project_media?.dbid && <FormattedMessage defaultMessage="Assign this Fact Check to a media item to be able to edit and publish a report" description="Tooltip for the report designer button" id="articleForm.reportDesignerTooltip" />}
                          {article.claim_description?.project_media?.dbid && factCheckFieldsMissing && <FormattedMessage defaultMessage="Fact-Check Title, Summary, and Language are required in order to publish a Fact-Check report" description="Tooltip for the report designer button" id="articleForm.reportDesignerTooltipTwo" />}
                          {article.claim_description?.project_media?.dbid && !factCheckFieldsMissing && <FormattedMessage defaultMessage="Go to Fact-Check report editor" description="Tooltip for the report designer button" id="articleForm.reportDesignerTooltipThree" />}
                        </>
                      }
                    >
                      <span>
                        <ButtonMain
                          className="media-fact-check__report-designer"
                          disabled={claimDescriptionMissing || !article.claim_description?.project_media?.dbid || factCheckFieldsMissing}
                          iconLeft={isPublished ? <IconReport /> : <IconUnpublishedReport />}
                          label={isPublished ?
                            <FormattedMessage
                              className="media-fact-check__published-report"
                              defaultMessage="Published report"
                              description="A label on a button that opens the report for this item. This displays if the report for this media item is currently in the 'Published' state."
                              id="articleForm.publishedReport"
                            /> :
                            <FormattedMessage
                              className="media-fact-check__unpublished-report"
                              defaultMessage="Unpublished report"
                              description="A label on a button that opens the report for this item. This displays if the report for this media item is NOT currently in the 'Published' state."
                              id="articleForm.unpublishedReport"
                            />
                          }
                          size="default"
                          theme={isPublished ? 'info' : 'alert'}
                          variant="contained"
                          onClick={() => handleGoToReport(article.claim_description.project_media.dbid)}
                        />
                      </span>
                    </Tooltip>
                  </div>
                }
              </div>
              <div className={inputStyles['form-fieldset']} id="article_form_tags">
                <TagList
                  setTags={handleTagChange}
                  tags={tags}
                  teamSlug={team.slug}
                />
              </div>
            </div>
          </div>
          { articleType === 'fact-check' &&
            <div className={styles['article-form-container']}>
              <div className={inputStyles['form-inner-wrapper']}>
                <div className={inputStyles['form-fieldset']} id="article-form">
                  <div className={inputStyles['form-fieldset-title']} id="article-form-title">
                    <FormattedMessage defaultMessage="Claim" description="Title of the claim section." id="articleForm.claim" />
                  </div>
                  <div className={inputStyles['form-fieldset-field']}>
                    <FormattedMessage
                      defaultMessage="For example: The earth is flat"
                      description="Placeholder for claim description field."
                      id="articleFormDescription.placeholder"
                    >
                      { placeholder => (
                        <TextArea
                          className="article-form__description"
                          defaultValue={claimDescription || ''}
                          error={claimDescriptionError}
                          id="article-form__description"
                          label={
                            <FormattedMessage
                              defaultMessage="Title"
                              description="Title for the text input for claim title"
                              id="articleForm.claimTitle"
                            />
                          }
                          maxHeight="266px"
                          placeholder={placeholder}
                          required
                          onBlur={(e) => {
                            const newValue = e.target.value.trim();
                            if (newValue.length) {
                              setClaimDescriptionError(false);
                              handleBlur('claim description', newValue);
                            } else {
                              setClaimDescriptionError(true);
                            }
                            setClaimDescription(newValue);
                          }}
                        />
                      )}
                    </FormattedMessage>
                  </div>
                  <div className={inputStyles['form-fieldset-field']}>
                    <FormattedMessage
                      defaultMessage="Add claim context"
                      description="Placeholder for claim context field."
                      id="articleForm.contextPlaceholder"
                    >
                      { placeholder => (
                        <TextArea
                          autoGrow
                          className="article-form__context"
                          defaultValue={claimDescription ? claimContext : ''}
                          id="article-form__context"
                          label={
                            <FormattedMessage
                              defaultMessage="Additional context"
                              description="Title of claim additional context field."
                              id="articleForm.contextTitle"
                            />
                          }
                          maxHeight="266px"
                          placeholder={placeholder}
                          rows="1"
                          onBlur={(e) => {
                            const newValue = e.target.value;
                            setClaimContext(newValue);
                            handleBlur('claim context', newValue);
                          }}
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
                  defaultMessage="Start by adding Claim information<br />for this Fact-Check"
                  description="Message overlay to tell the user they must complete additional fields to unlock this area"
                  id="articleForm.noClaimDescript"
                />
              </div>
              : null
            }
            <div className={inputStyles['form-inner-wrapper']}>
              <div className={inputStyles['form-fieldset']} id="article-form">
                { articleType === 'fact-check' &&
                  <div className={inputStyles['form-fieldset-title']} id="media__fact-check-title">
                    <FormattedMessage defaultMessage="Fact-check" description="Title of the media fact-check section." id="mediaFactCheck.factCheck" />
                  </div>
                }
                { articleType === 'fact-check' && isPublished && (
                  <Alert
                    buttonLabel={<FormattedMessage defaultMessage="Update Report" description="Label of alert button in article form." id="articleForm.reportPublishedLabel" />}
                    className={styles['article-form-alert']}
                    contained
                    content={<FormattedMessage defaultMessage="To make edits, pause this report. This will stop the report from being sent out to users until it is published again" description="Text of alert box in article form." id="articleForm.reportPublishedBody" />}
                    icon
                    title={<FormattedMessage defaultMessage="Report is published" description="Title of alert box in article form." id="articleForm.reportPublishedTitle" />}
                    variant="success"
                    onButtonClick={() => handleGoToReport(article.claim_description?.project_media?.dbid)}
                  />
                )}
                <div className={inputStyles['form-inner-wrapper']}>
                  <div className={inputStyles['form-fieldset-field']}>
                    { articleType === 'explainer' ?
                      <FormattedMessage
                        defaultMessage="A descriptive title for this explainer article"
                        description="Placeholder instructions for article title field"
                        id="articleForm.explainerTitleInputPlaceholder"
                      >
                        { placeholder => (<TextArea
                          autoGrow
                          className="article-form__title"
                          componentProps={{
                            id: 'article-form__title',
                          }}
                          defaultValue={articleTitle}
                          error={titleError || (charCountError && articleTitle.length)}
                          helpContent={charCountError && articleTitle.length ? maxCountErrorMessage : null}
                          label={<FormattedMessage defaultMessage="Title" description="Label for explainer title field" id="articleForm.explainerTitle" />}
                          maxHeight="266px"
                          name="title"
                          placeholder={placeholder}
                          required
                          rows="1"
                          onBlur={(e) => {
                            const newValue = e.target.value.trim();
                            if (newValue.length) {
                              setTitleError(false);
                              handleBlur('title', newValue);
                            } else {
                              setTitleError(true);
                            }
                            setArticleTitle(newValue);
                          }}
                          onKeyUp={e => setArticleTitle(e.target.value.trim())}
                        />)}
                      </FormattedMessage> :
                      <FormattedMessage
                        defaultMessage="A descriptive title for this fact-check article"
                        description="Placeholder instructions for article title field"
                        id="articleForm.factCheckTitleInputPlaceholder"
                      >
                        { placeholder => (<TextArea
                          autoGrow
                          className="article-form__title"
                          componentProps={{
                            id: 'article-form__title',
                          }}
                          defaultValue={isFactCheckValueBlank(articleTitle) ? null : articleTitle}
                          disabled={readOnly}
                          error={titleError || (charCountError && articleTitle.length)}
                          helpContent={charCountError && articleTitle.length ? maxCountErrorMessage : null}
                          label={<FormattedMessage defaultMessage="Title" description="Label for fact-check title field" id="articleForm.factCheckTitle" />}
                          maxHeight="266px"
                          name="title"
                          placeholder={placeholder}
                          rows="1"
                          onBlur={(e) => {
                            const newValue = e.target.value.trim();
                            if (newValue.length) {
                              handleBlur('title', newValue);
                            }
                            setArticleTitle(newValue);
                          }}
                          onKeyUp={e => setArticleTitle(e.target.value.trim())}
                        />)}
                      </FormattedMessage>}
                  </div>
                  <div className={inputStyles['form-fieldset-field']}>
                    {articleType === 'explainer' ?
                      <FormattedMessage
                        defaultMessage="Briefly contextualize the narrative of this explainer"
                        description="Placeholder instructions for explainer summary field"
                        id="articleForm.explainerSummaryPlaceholder"
                      >
                        { placeholder => (
                          <TextArea
                            autoGrow
                            className="article-form__summary"
                            componentProps={{
                              id: 'article-form__summary',
                            }}
                            defaultValue={truncateLength(summary, 4096 - articleTitle.length - url.length - 3)}
                            error={summaryError || (charCountError && summary.length)}
                            helpContent={charCountError && summary.length ? maxCountErrorMessage : null}
                            label={<FormattedMessage defaultMessage="Summary" description="Label for article summary field" id="articleForm.explainerSummary" />}
                            maxHeight="500px"
                            name="summary"
                            placeholder={placeholder}
                            required
                            rows="1"
                            onBlur={(e) => {
                              const newValue = e.target.value.trim();
                              if (newValue.length) {
                                setSummaryError(false);
                                handleBlur('description', newValue);
                              } else {
                                setSummaryError(true);
                              }
                              setSummary(newValue);
                            }}
                            onKeyUp={e => setSummary(e.target.value.trim())}
                          />
                        )}
                      </FormattedMessage> :
                      <FormattedMessage
                        defaultMessage="Briefly contextualize the narrative of this fact-check"
                        description="Placeholder instructions for fact-check summary field"
                        id="articleForm.factCheckSummaryPlaceholder"
                      >
                        { placeholder => (
                          <TextArea
                            autoGrow
                            className="article-form__summary"
                            componentProps={{
                              id: 'article-form__summary',
                            }}
                            defaultValue={isFactCheckValueBlank(summary) ? null : truncateLength(summary, 900 - articleTitle.length - url.length - 3)}
                            disabled={readOnly}
                            error={summaryError || (charCountError && summary.length)}
                            helpContent={charCountError && summary.length ? maxCountErrorMessage : null}
                            key={`article-form__summary-${claimDescription?.description ? '-with-claim' : '-no-claim'}`}
                            label={<FormattedMessage defaultMessage="Summary" description="Label for article summary field" id="articleForm.summary" />}
                            name="summary"
                            placeholder={placeholder}
                            required={false}
                            rows="1"
                            onBlur={(e) => {
                              const newValue = e.target.value.trim();
                              if (newValue.length) {
                                handleBlur('summary', newValue);
                              }
                              setSummary(newValue);
                            }}
                            onKeyUp={e => setSummary(e.target.value.trim())}
                          />
                        )}
                      </FormattedMessage>
                    }
                  </div>
                  <div className={inputStyles['form-fieldset-field']}>
                    {articleType === 'explainer' ?
                      <FormattedMessage
                        defaultMessage="Add a URL to this explainer article"
                        description="Placeholder instructions for URL field"
                        id="articleForm.explainerUrlPlaceholder"
                      >
                        { placeholder => (
                          <TextField
                            className="article-form__url"
                            componentProps={{
                              id: 'article-form__url',
                            }}
                            defaultValue={url}
                            error={charCountError && url.length}
                            helpContent={charCountError && url.length ? maxCountErrorMessage : null}
                            label={<FormattedMessage defaultMessage="Article URL" description="Label for article URL field" id="articleForm.explainerUrl" />}
                            placeholder={placeholder}
                            onBlur={(e) => {
                              const newValue = e.target.value;
                              let newUrl = newValue;
                              if (!/^https?:\/\//.test(newValue) && newValue && newValue.length > 0) {
                                newUrl = `https://${newValue}`;
                              }
                              setUrl(newUrl);
                              handleBlur('url', newUrl);
                            }}
                            onKeyUp={e => setUrl(e.target.value.trim())}
                          />
                        )}
                      </FormattedMessage> :
                      <FormattedMessage
                        defaultMessage="Add a URL to this fact-check article"
                        description="Placeholder instructions for URL field"
                        id="articleForm.factCheckUrlPlaceholder"
                      >
                        { placeholder => (
                          <TextField
                            className="article-form__url"
                            componentProps={{
                              id: 'article-form__url',
                            }}
                            defaultValue={url}
                            disabled={readOnly}
                            error={charCountError && url.length}
                            helpContent={charCountError && url.length ? maxCountErrorMessage : null}
                            key={`article-form__url-${claimDescription?.description ? '-with-claim' : '-no-claim'}`}
                            label={<FormattedMessage defaultMessage="Article URL" description="Label for article URL field" id="articleForm.factCheckUrl" />}
                            placeholder={placeholder}
                            onBlur={(e) => {
                              const newValue = e.target.value;
                              let newUrl = newValue;
                              if (!/^https?:\/\//.test(newValue) && newValue && newValue.length > 0) {
                                newUrl = `https://${newValue}`;
                              }
                              setUrl(newUrl);
                              handleBlur('url', newUrl);
                            }}
                            onKeyUp={e => setUrl(e.target.value.trim())}
                          />
                        )}
                      </FormattedMessage>
                    }
                  </div>
                  <div className={inputStyles['input-wrapper']}>
                    <div className={cx(
                      [inputStyles['help-container']],
                      {
                        'int-error__message--textfield': charCountError,
                        [inputStyles['error-label']]: charCountError,
                      })}
                    >
                      { charCountError && <ErrorIcon className={inputStyles['error-icon']} />}
                      <FormattedMessage
                        defaultMessage="{count, plural, one {# character left} other {# characters left}}"
                        description="Label for the character count remaining in the combined text fields"
                        id="articleForm.characterCount"
                        values={{ count: maxCount - charCount }}
                      />
                    </div>
                  </div>
                </div>
                { languages.length > 1 ?
                  <div className={inputStyles['form-fieldset-field']}>
                    <LanguagePickerSelect
                      isDisabled={readOnly}
                      label={<FormattedMessage defaultMessage="Language" description="Label for input to select language" id="articleForm.selectLanguageLabel" />}
                      languages={languages}
                      selectedLanguage={language}
                      onSubmit={handleLanguageSubmit}
                    />
                  </div> : null
                }
              </div>
            </div>
          </div>
        </>
      }
      footer
      mainActionButton={mode === 'create' ? (
        <ButtonMain
          buttonProps={{ id: 'article-form__save-button' }}
          disabled={!isValid || saving}
          label={mainActionButtonLabel}
          onClick={() => handleSave({ publish: createAndPublish })}
        />
      ) : (
        <ArticleTrash
          article={article}
          type={articleType}
          onClose={onClose}
        />
      )}
      secondaryActionButton={(articleType === 'fact-check') && createAndPublish ? (
        <ButtonMain
          buttonProps={{ id: 'article-form__save-unpublished-button' }}
          disabled={!isValid || saving}
          label={secondaryActionButtonLabelFactCheck}
          theme="lightBeige"
          variant="contained"
          onClick={() => handleSave({ publish: false })}
        />
      ) : null}
      showCancel={mode === 'create'} // just here until trash is added
      title={title}
      onClose={onClose}
    />
  );
};

ArticleForm.defaultProps = {
  article: {},
  createFromMediaPage: false,
  handleSave: null,
  saving: false,
};

ArticleForm.propTypes = {
  article: PropTypes.object,
  articleType: PropTypes.oneOf(['fact-check', 'explainer']).isRequired,
  createFromMediaPage: PropTypes.bool,
  handleBlur: PropTypes.func.isRequired,
  handleSave: PropTypes.func,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  saving: PropTypes.bool,
  team: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default createFragmentContainer(ArticleForm, graphql`
  fragment ArticleForm_team on Team {
    verification_statuses
    get_language
    get_languages
    slug
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
          title
          type
          full_url
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
    ...ArticleTrash_article
  }
`);
