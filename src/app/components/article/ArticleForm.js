import React, { useEffect } from 'react';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, FormattedDate } from 'react-intl';
import ArticleTrash from './ArticleTrash.js';
import CheckArticleTypes from '../../constants/CheckArticleTypes.js';
import TagList from '../cds/menus-lists-dialogs/TagList.js';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import Slideout from '../cds/slideout/Slideout';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import IconReport from '../../icons/fact_check.svg';
import IconUnpublishedReport from '../../icons/unpublished_report.svg';
import TextArea from '../cds/inputs/TextArea';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import LanguagePickerSelect from '../cds/inputs/LanguagePickerSelect';
import inputStyles from '../../styles/css/inputs.module.css';
import CheckPropTypes from '../../CheckPropTypes';
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
      {articleType === CheckArticleTypes.EXPLAINER && mode === 'create' && <FormattedMessage defaultMessage="Create Explainer Article" description="Title for the slideout create explainer form" id="article-form-explainer-create-title" />}
      {articleType === CheckArticleTypes.EXPLAINER && mode === 'edit' && <FormattedMessage defaultMessage="Edit Explainer Article" description="Title for the slideout edit explainer form" id="article-form-explainer-edit-title" />}
      {articleType === CheckArticleTypes.FACT_CHECK && mode === 'create' && <FormattedMessage defaultMessage="Create New Claim & Fact-Check Article" description="Title for the slideout create fact-check form" id="article-form-fact-check-create-title" />}
      {articleType === CheckArticleTypes.FACT_CHECK && mode === 'edit' && <FormattedMessage defaultMessage="Edit Claim & Fact-Check Article" description="Title for the slideout edit fact-check form" id="article-form-fact-check-edit-title" />}
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

  const [isValid, setIsValid] = React.useState(false);
  const [canPublish, setCanPublish] = React.useState(false);
  const createAndPublish = createFromMediaPage && canPublish;

  const isPublished = article.report_status === 'published';
  const readOnly = isPublished;
  const publishedAt = isPublished ? article.updated_at : null;
  const isStatusLocked = article.claim_description?.project_media?.last_status_obj?.locked || false;
  const factCheckFieldsMissing = (articleType === CheckArticleTypes.FACT_CHECK && (isFactCheckValueBlank(articleTitle) || isFactCheckValueBlank(summary) || !language));

  React.useEffect(() => {
    setLanguage(language || defaultArticleLanguage);
  }, [language]);

  useEffect(() => {
    if (articleType === CheckArticleTypes.EXPLAINER && articleTitle?.length && summary?.length && language?.length) {
      setIsValid(true);
    } else if (articleType === CheckArticleTypes.FACT_CHECK && claimDescription) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
    if (articleType === CheckArticleTypes.FACT_CHECK && claimDescription && articleTitle && summary && language) {
      setCanPublish(true);
    } else if (articleType === CheckArticleTypes.FACT_CHECK) {
      setCanPublish(false);
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

  const mainActionButtonLabel = articleType === CheckArticleTypes.EXPLAINER ? mainActionButtonLabelExplainer : mainActionButtonLabelFactCheck;

  return (
    <Slideout
      content={
        <>
          <div className={styles['article-form-container']}>
            { mode === 'edit' &&
              <div className={styles['article-form-info']}>
                <div className={styles['article-form-info-labels']}>
                  { article.created_at &&
                    <div className="typography-subtitle2">
                      <FormattedMessage
                        defaultMessage="Created by:"
                        description="Label to convey when the item was created"
                        id="articleForm.createdByLabel"
                      />
                    </div>
                  }
                  { article.updated_at &&
                    <div className="typography-subtitle2">
                      <FormattedMessage
                        defaultMessage="Last Edited:"
                        description="Label to convey when the item was last edited"
                        id="articleForm.editedByLabel"
                      />
                    </div>
                  }
                  { publishedAt && articleType === CheckArticleTypes.FACT_CHECK &&
                    <div className="typography-subtitle2">
                      <FormattedMessage
                        defaultMessage="Last Published:"
                        description="Label to convey when the item was last published"
                        id="articleForm.publishedAtDate"
                      />
                    </div>
                  }
                  { articleType === CheckArticleTypes.FACT_CHECK && article.claim_description?.project_media && article.claim_description?.project_media?.type !== 'Blank' &&
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
                  { article.created_at &&
                    <div className="typography-body2">
                      {article.author?.name ?
                        <>
                          {article.author.name}, <FormattedDate day="numeric" hour="numeric" minute="numeric" month="long" value={new Date(article.created_at * 1000)} year="numeric" />
                        </>
                        : <FormattedDate day="numeric" hour="numeric" minute="numeric" month="long" value={new Date(article.created_at * 1000)} year="numeric" />
                      }
                    </div>
                  }
                  { article.updated_at &&
                    <div className="typography-body2">
                      {article.user.name}, <FormattedDate day="numeric" hour="numeric" minute="numeric" month="long" value={new Date(article.updated_at * 1000)} year="numeric" />
                    </div>
                  }
                  { publishedAt && articleType === CheckArticleTypes.FACT_CHECK &&
                    <div className="typography-body2">
                      <FormattedDate day="numeric" month="long" value={new Date(publishedAt * 1000)} year="numeric" />
                    </div>
                  }
                  { articleType === CheckArticleTypes.FACT_CHECK && article.claim_description?.project_media && article.claim_description?.project_media?.type !== 'Blank' &&
                    <div className="typography-body2">
                      <ExternalLink maxUrlLength={50} title={article.claim_description?.project_media.title} url={article.claim_description?.project_media.full_url} />
                    </div>
                  }
                </div>
              </div>
            }
            <div className={inputStyles['form-inner-wrapper']}>
              <div className={styles['article-rating-wrapper']}>
                { articleType === CheckArticleTypes.FACT_CHECK && statuses &&
                  <RatingSelector
                    disabled={isPublished || isStatusLocked}
                    status={status}
                    statuses={statuses}
                    onStatusChange={handleStatusChange}
                  />
                }
                { articleType === CheckArticleTypes.FACT_CHECK &&
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
          { articleType === CheckArticleTypes.FACT_CHECK &&
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
                              handleBlur('claim description', newValue);
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
            { claimDescriptionMissing && articleType === CheckArticleTypes.FACT_CHECK ?
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
                { articleType === CheckArticleTypes.FACT_CHECK &&
                  <div className={inputStyles['form-fieldset-title']} id="media__fact-check-title">
                    <FormattedMessage defaultMessage="Fact-check" description="Title of the media fact-check section." id="mediaFactCheck.factCheck" />
                  </div>
                }
                { articleType === CheckArticleTypes.FACT_CHECK && isPublished && (
                  <Alert
                    border
                    buttonLabel={<FormattedMessage defaultMessage="Update Report" description="Label of alert button in article form." id="articleForm.reportPublishedLabel" />}
                    className={styles['article-form-alert']}
                    content={<FormattedMessage defaultMessage="To make edits, pause this report. This will stop the report from being sent out to users until it is published again" description="Text of alert box in article form." id="articleForm.reportPublishedBody" />}
                    icon
                    placement="contained"
                    title={<FormattedMessage defaultMessage="Report is published" description="Title of alert box in article form." id="articleForm.reportPublishedTitle" />}
                    variant="success"
                    onButtonClick={() => handleGoToReport(article.claim_description?.project_media?.dbid)}
                  />
                )}
                <div className={inputStyles['form-inner-wrapper']}>
                  <div className={inputStyles['form-fieldset-field']}>
                    { articleType === CheckArticleTypes.EXPLAINER ?
                      <FormattedMessage
                        defaultMessage="A descriptive title for this explainer article"
                        description="Placeholder instructions for article title field"
                        id="articleForm.explainerTitleInputPlaceholder"
                      >
                        { placeholder => (<LimitedTextArea
                          autoGrow
                          className="article-form__title"
                          componentProps={{
                            id: 'article-form__title',
                          }}
                          defaultValue={articleTitle}
                          label={<FormattedMessage defaultMessage="Title" description="Label for explainer title field" id="articleForm.explainerTitle" />}
                          maxChars={35}
                          maxHeight="266px"
                          maxLength={35}
                          name="title"
                          placeholder={placeholder}
                          required
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
                      </FormattedMessage> :
                      <FormattedMessage
                        defaultMessage="A descriptive title for this fact-check article"
                        description="Placeholder instructions for article title field"
                        id="articleForm.factCheckTitleInputPlaceholder"
                      >
                        { placeholder => (<LimitedTextArea
                          autoGrow
                          className="article-form__title"
                          componentProps={{
                            id: 'article-form__title',
                          }}
                          defaultValue={isFactCheckValueBlank(articleTitle) ? null : articleTitle}
                          disabled={readOnly}
                          label={<FormattedMessage defaultMessage="Title" description="Label for fact-check title field" id="articleForm.factCheckTitle" />}
                          maxChars={35}
                          maxHeight="266px"
                          maxLength={35}
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
                    {articleType === CheckArticleTypes.EXPLAINER ?
                      <FormattedMessage
                        defaultMessage="Briefly contextualize the narrative of this explainer"
                        description="Placeholder instructions for explainer summary field"
                        id="articleForm.explainerSummaryPlaceholder"
                      >
                        { placeholder => (
                          <LimitedTextArea
                            autoGrow
                            className="article-form__summary"
                            componentProps={{
                              id: 'article-form__summary',
                            }}
                            defaultValue={truncateLength(summary, 4096 - articleTitle.length - url.length - 3)}
                            label={<FormattedMessage defaultMessage="Summary" description="Label for article summary field" id="articleForm.explainerSummary" />}
                            maxChars={3956}
                            maxHeight="500px"
                            maxLength={3956}
                            name="summary"
                            placeholder={placeholder}
                            required
                            rows="1"
                            onBlur={(e) => {
                              const newValue = e.target.value.trim();
                              if (newValue.length) {
                                handleBlur('description', newValue);
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
                          <LimitedTextArea
                            autoGrow
                            className="article-form__summary"
                            componentProps={{
                              id: 'article-form__summary',
                            }}
                            defaultValue={isFactCheckValueBlank(summary) ? null : truncateLength(summary, 900 - articleTitle.length - url.length - 3)}
                            disabled={readOnly}
                            key={`article-form__summary-${claimDescription?.description ? '-with-claim' : '-no-claim'}`}
                            label={<FormattedMessage defaultMessage="Summary" description="Label for article summary field" id="articleForm.summary" />}
                            maxChars={3956}
                            maxLength={3956}
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
                    {articleType === CheckArticleTypes.EXPLAINER ?
                      <FormattedMessage
                        defaultMessage="Add a URL to this explainer article"
                        description="Placeholder instructions for URL field"
                        id="articleForm.explainerUrlPlaceholder"
                      >
                        { placeholder => (
                          <LimitedTextArea
                            className="article-form__url"
                            componentProps={{
                              id: 'article-form__url',
                            }}
                            defaultValue={url}
                            label={<FormattedMessage defaultMessage="Article URL" description="Label for article URL field" id="articleForm.explainerUrl" />}
                            maxChars={35}
                            maxLength={35}
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
                          <LimitedTextArea
                            className="article-form__url"
                            componentProps={{
                              id: 'article-form__url',
                            }}
                            defaultValue={url}
                            disabled={readOnly}
                            key={`article-form__url-${claimDescription?.description ? '-with-claim' : '-no-claim'}`}
                            label={<FormattedMessage defaultMessage="Article URL" description="Label for article URL field" id="articleForm.factCheckUrl" />}
                            maxChars={35}
                            maxLength={35}
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
      secondaryActionButton={(articleType === CheckArticleTypes.FACT_CHECK) && createAndPublish ? (
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
  articleType: CheckPropTypes.articleType.isRequired,
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
      author {
        name
      }
      updated_at
      created_at
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
      author {
        name
      }
      updated_at
      created_at
      user {
        name
      }
    }
    ...ArticleTrash_article
  }
`);
