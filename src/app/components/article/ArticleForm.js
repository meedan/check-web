import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Slideout from '../cds/slideout/Slideout';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TagList from '../cds/menus-lists-dialogs/TagList';
import TextArea from '../cds/inputs/TextArea';
import TextField from '../cds/inputs/TextField';
import LanguagePickerSelect from '../cds/inputs/LanguagePickerSelect';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import DeleteIcon from '../../icons/delete.svg';
import inputStyles from '../../styles/css/inputs.module.css';
import { safelyParseJSON, truncateLength } from '../../helpers';
import styles from './ArticleForm.module.css';

const ArticleForm = ({
  handleSave,
  onClose,
  handleBlur,
  handleDelete,
  articleType,
  mode,
  article,
  team,
  projectMedia,
}) => {
  const title = <FormattedMessage id="article-form-slideout-title" defaultMessage="{mode} {formType}" description="Title for the slideout article form" values={{ mode: mode === 'create' ? 'Create New' : 'Edit ', formType: articleType === 'explainer' ? 'Explainer' : 'Claim & Fact Check' }} />;

  const [claimDescription, setClaimDescription] = React.useState(articleType === 'fact check' && projectMedia?.suggested_main_item ? projectMedia.suggested_main_item.claim_description : '');
  const [claimContext, setClaimContext] = React.useState('');

  const languages = safelyParseJSON(team.get_languages) || ['en'];
  const defaultArticleLanguage = languages && languages.length === 1 ? languages[0] : null;
  const [articleTitle, setArticleTitle] = React.useState((article && article.title) ? article.title : '');
  const [summary, setSummary] = React.useState(article && article.summary ? article.summary : '');
  const [url, setUrl] = React.useState((article && article.url) ? article.url : '');
  const [language, setLanguage] = React.useState(article && article.language ? article.language : null);
  const [tags, setTags] = React.useState(article && article.tags ? article.tags : []);
  const claimDescriptionMissing = !claimDescription || claimDescription.description?.trim()?.length === 0;

  const [isValid, setIsValid] = React.useState(false);

  const error = false;

  React.useEffect(() => {
    setLanguage(language || defaultArticleLanguage);
  }, [language]);

  useEffect(() => {
    if (!isValid && articleType === 'explainer' && articleTitle?.length && summary?.length && language?.length) {
      setIsValid(true);
    } else if (!isValid && articleType === 'fact check' && articleTitle?.length && summary?.length) {
      setIsValid(true);
    }
  }, [articleTitle, summary, claimDescription, language]);

  const handleLanguageSubmit = (value) => {
    const { languageCode } = value;
    setLanguage(languageCode);
    handleBlur('language', languageCode);
  };

  const handleTagChange = (newtags) => {
    setTags(newtags);
    handleBlur('tags', newtags);
  };

  return (
    <Slideout
      title={title}
      content={
        <>
          <div className={styles['article-form-container']}>
            <div className={inputStyles['form-inner-wrapper']}>
              <div id="article_form_tags" className={inputStyles['form-fieldset']}>
                <TagList
                  tags={tags}
                  setTags={handleTagChange}
                />
              </div>
            </div>
          </div>
          { articleType === 'fact check' &&
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
                          defaultValue={claimDescription ? claimDescription.description : ''}
                          onBlur={(e) => {
                            const newValue = e.target.value;
                            setClaimDescription(newValue);
                            handleBlur('claim description', newValue);
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
            { claimDescriptionMissing && articleType === 'fact check' ?
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
                { articleType === 'fact check' &&
                  <div id="media__fact-check-title" className={inputStyles['form-fieldset-title']}>
                    <FormattedMessage id="mediaFactCheck.factCheck" defaultMessage="Fact-check" description="Title of the media fact-check section." />
                  </div>
                }
                <div className={inputStyles['form-fieldset-field']}>
                  <FormattedMessage
                    id="articleForm.titleInputPlaceholder"
                    defaultMessage="A descriptive title for this {subject} article"
                    description="Placeholder instructions for article title field"
                    values={{
                      subject: articleType,
                    }}
                  >
                    { placeholder => (
                      <TextArea
                        defaultValue={articleTitle}
                        componentProps={{
                          id: 'article-form__title',
                        }}
                        className="article-form__title"
                        name="title"
                        required
                        rows="1"
                        helpContent={error ? <FormattedMessage id="articleForm.errorTitle" defaultMessage="Title is required" description="Caption that informs that an article could not be saved and that the title field has to be filled" /> : null}
                        autoGrow
                        maxHeight="266px"
                        placeholder={placeholder}
                        label={<FormattedMessage id="articleForm.title" defaultMessage="Title" description="Label for article title field" />}
                        onBlur={(e) => {
                          const newValue = e.target.value;
                          setArticleTitle(newValue);
                          handleBlur('title', newValue);
                        }}
                      />
                    )}
                  </FormattedMessage>
                </div>
                <div className={inputStyles['form-fieldset-field']}>
                  <FormattedMessage
                    id="articleForm.summaryPlaceholder"
                    defaultMessage="Briefly contextualize the narrative of this {subject}"
                    description="Placeholder instructions for article summary field"
                    values={{
                      subject: articleType === 'explainer' ? 'explainer' : 'fact check',
                    }}
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
                        helpContent={error ? <FormattedMessage id="articleForm.errorSummary" defaultMessage="Article summary is required" description="Caption that informs that an article could not be saved and that the summary field has to be filled" /> : null}
                        autoGrow
                        placeholder={placeholder}
                        onBlur={(e) => {
                          const newValue = e.target.value;
                          setSummary(newValue);
                          handleBlur('description', newValue);
                        }}
                      />
                    )}
                  </FormattedMessage>
                </div>
                <div className={inputStyles['form-fieldset-field']}>
                  <FormattedMessage
                    id="articleForm.urlPlaceholder"
                    defaultMessage="Add a URL to this {subject} article"
                    description="Placeholder instructions for URL field"
                    values={{
                      subject: articleType === 'explainer' ? 'explainer' : 'fact check',
                    }}
                  >
                    { placeholder => (
                      <TextField
                        label={<FormattedMessage id="articleForm.url" defaultMessage="Article URL" description="Label for article URL field" />}
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
      showCancel={mode === 'create'}
      mainActionButton={mode === 'create' ? <ButtonMain
        onClick={handleSave}
        disabled={!isValid}
        label={<FormattedMessage id="articleForm.formSaveButton" defaultMessage="Create content" description="the save button for the article forom" />}
      /> : <ButtonMain
        onClick={handleDelete}
        iconLeft={<DeleteIcon />}
        theme="error"
        label={<FormattedMessage id="articleForm.formDeleteButton" defaultMessage="Move to Trash" description="delete the current article" />}
      />}
    />
  );
};

ArticleForm.defaultProps = {
  handleSave: null,
  handleDelete: null,
  article: null,
  projectMedia: null,
};

ArticleForm.propTypes = {
  handleSave: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  articleType: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  article: PropTypes.object,
  team: PropTypes.object.isRequired,
  projectMedia: PropTypes.object,
};

export default ArticleForm;
