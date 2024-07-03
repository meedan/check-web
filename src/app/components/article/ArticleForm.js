import React, { useEffect } from 'react';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';
import Slideout from '../cds/slideout/Slideout';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import IconReport from '../../icons/fact_check.svg';
import IconUnpublishedReport from '../../icons/unpublished_report.svg';
import TagList from '../cds/menus-lists-dialogs/TagList';
import TextArea from '../cds/inputs/TextArea';
import TextField from '../cds/inputs/TextField';
import LanguagePickerSelect from '../cds/inputs/LanguagePickerSelect';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
// import DeleteIcon from '../../icons/delete.svg';
import inputStyles from '../../styles/css/inputs.module.css';
import { safelyParseJSON, truncateLength } from '../../helpers';
import styles from './ArticleForm.module.css';
import RatingSelector from '../cds/inputs/RatingSelector';

const ArticleForm = ({
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
      {articleType === 'explainer' && mode === 'create' && <FormattedMessage id="article-form-explainer-create-title" defaultMessage="Create Explainer" description="Title for the slideout create explainer form" />}
      {articleType === 'explainer' && mode === 'edit' && <FormattedMessage id="article-form-explainer-edit-title" defaultMessage="Edit Explainer" description="Title for the slideout edit explainer form" />}
      {articleType === 'fact-check' && mode === 'create' && <FormattedMessage id="article-form-fact-check-create-title" defaultMessage="Create New Claim & Fact-Check" description="Title for the slideout create fact check form" />}
      {articleType === 'fact-check' && mode === 'edit' && <FormattedMessage id="article-form-fact-check-edit-title" defaultMessage="Edit Claim & Fact-Check" description="Title for the slideout edit fact check form" />}
    </>
  );

  const [claimDescription, setClaimDescription] = React.useState(article?.claim_description?.description || '');
  const [claimContext, setClaimContext] = React.useState(article?.claim_description?.context || '');
  const options = team?.tag_texts?.edges.map(edge => ({ label: edge.node.text, value: edge.node.text })) || team.teamTags.map(tag => ({ label: tag, value: tag }));


  const languages = safelyParseJSON(team.get_languages) || ['en'];
  const defaultArticleLanguage = languages && languages.length === 1 ? languages[0] : null;
  const [articleTitle, setArticleTitle] = React.useState(article?.title || '');
  const [summary, setSummary] = React.useState(article?.summary || article?.description || '');
  const [url, setUrl] = React.useState(article?.url || '');
  const [language, setLanguage] = React.useState(article?.language || null);
  const [tags, setTags] = React.useState(article?.tags || []);
  const [status, setStatus] = React.useState(article?.claim_description?.project_media?.status || article?.rating || '');
  const claimDescriptionMissing = !claimDescription || claimDescription.description?.trim()?.length === 0;
  const statuses = article?.statuses || team.verification_statuses || null;

  const [summaryError, setSummaryError] = React.useState(false);
  const [titleError, setTitleError] = React.useState(false);
  const [claimDescriptionError, setClaimDescriptionError] = React.useState(false);


  const [isValid, setIsValid] = React.useState(false);

  React.useEffect(() => {
    setLanguage(language || defaultArticleLanguage);
  }, [language]);

  useEffect(() => {
    if (!isValid && articleType === 'explainer' && articleTitle?.length && summary?.length && language?.length) {
      setIsValid(true);
    } else if (!isValid && articleType === 'fact-check' && articleTitle?.length && summary?.length) {
      setIsValid(true);
    }
  }, [articleTitle, summary, claimDescription, language]);

  const handleGoToReport = (id) => {
    if (window.location.pathname.indexOf('/media/') > 0) {
      window.location.assign(`${window.location.pathname.replace(/\/(suggested-matches|similar-media)\/?$/, '').replace(/\/$/, '')}/report`);
    } else {
      const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
      window.location.assign(`../../${teamSlug}/media/${id}/report`);
    }
  };

  const handleLanguageSubmit = (value) => {
    const { languageCode } = value;
    setLanguage(languageCode);
    handleBlur('language', languageCode);
  };

  const handleTagChange = (newtags) => {
    setTags(newtags);
    handleBlur('tags', newtags);
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
                  { article.publishedAt && articleType === 'fact-check' &&
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
                  { article.publishedAt && articleType === 'fact-check' &&
                    <div className="typography-body2">
                      <FormattedDate value={new Date(article.publishedAt * 1000)} year="numeric" month="long" day="numeric" />
                    </div>
                  }
                </div>
              </div>
            }
            <div className={inputStyles['form-inner-wrapper']}>
              <div className={styles['article-rating-wrapper']}>
                { articleType === 'fact-check' && statuses &&
                  <RatingSelector status={status} statuses={statuses} onStatusChange={handleStatusChange} />
                }
                { articleType === 'fact-check' && article?.claim_description?.project_media?.id &&
                  <div className={inputStyles['form-fieldset-field']}>
                    <ButtonMain
                      onClick={() => handleGoToReport(article.claim_description.project_media.id)}
                      className="media-fact-check__report-designer"
                      variant="contained"
                      theme={article?.publishedAt ? 'brand' : 'alert'}
                      size="default"
                      iconLeft={article?.publishedAt ? <IconReport /> : <IconUnpublishedReport />}
                      disabled={claimDescriptionMissing}
                      label={article?.publishedAt ?
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
                  <div id="article-form__context" className={inputStyles['form-fieldset-field']}>
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
              <div className={styles['article-form-no-claim-overlay']}>
                <div className={styles['article-form-no-claim-container']}>
                  <div className="typography-subtitle2">
                    <FormattedMessage
                      id="articleForm.noClaimDescript"
                      defaultMessage="Start by adding Claim information for this Fact-Check"
                      description="Message overlay to tell the user they must complete additional fields to unlock this area"
                    />
                  </div>
                </div>
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
                      required={articleType === 'explainer'}
                      selectedLanguage={language}
                      onSubmit={handleLanguageSubmit}
                      languages={languages}
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
        disabled={!isValid}
        label={<FormattedMessage id="articleForm.formSaveButton" defaultMessage="Create content" description="the save button for the article forom" />}
      /> : null}
    />
  );
};

ArticleForm.defaultProps = {
  handleSave: null,
  article: null,
};

ArticleForm.propTypes = {
  handleSave: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  articleType: PropTypes.oneOf(['fact-check', 'explainer']).isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  article: PropTypes.object,
  team: PropTypes.object.isRequired,
};

export default createFragmentContainer(ArticleForm, graphql`
  fragment ArticleForm_team on Team {
    get_languages
    tag_texts(last: 50) {
      edges {
        node {
          text
        }
      }
    }
  }
`);
