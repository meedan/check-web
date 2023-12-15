import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import TextArea from '../../cds/inputs/TextArea';
import { ToggleButton, ToggleButtonGroup } from '../../cds/inputs/ToggleButtonGroup';
import ColorPicker from '../../layout/ColorPicker';
import UploadFile from '../../UploadFile';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import LanguagePickerSelect from '../../cds/inputs/LanguagePickerSelect';
import { formatDate } from './reportDesignerHelpers';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';
import { safelyParseJSON } from '../../../helpers';
import styles from './ReportDesigner.module.css';
import inputStyles from '../../../styles/css/inputs.module.css';

const ReportDesignerForm = (props) => {
  const { media, team } = props;
  const data = props.data || { use_text_message: true, text: '' };
  const currentLanguage = data.language;
  const languages = safelyParseJSON(team.get_languages) || [];
  const default_reports = team.get_report || {};

  const handleImageChange = (image) => {
    props.onUpdate('image', image);
  };

  const handleImageError = () => {
    props.onUpdate('image', null);
  };

  const handleDefaultImage = () => {
    if (media && media.media && media.media.picture) {
      props.onUpdate('image', media.media.picture);
    }
  };

  const handleRemoveImage = () => {
    props.onUpdate('image', ' ');
  };

  const handleLanguageSubmit = (value) => {
    const { languageCode } = value;
    const updates = { language: languageCode };
    if (languageCode !== currentLanguage) {
      const default_report = default_reports[languageCode] || {};
      updates.use_introduction = !!default_report.use_introduction;
      updates.introduction = default_report.introduction;
    }
    props.onUpdate(updates);
  };

  const handleChangeColor = (event) => {
    props.onUpdate('theme_color', event.target.value);
  };

  return (
    <div className={styles['report-designer-form']}>
      { languages.length > 1 ?
        <div
          className={cx(
            styles['report-designer-form-container'],
            {
              [styles['report-designer-form-disabled']]: props.disabled,
            })
          }
        >
          <div className={inputStyles['form-fieldset']}>
            <div className={inputStyles['form-fieldset-title']}>
              <FormattedMessage id="reportDesigner.languageTitle" defaultMessage="Report Language" description="Section title for the report language" />
            </div>
            <LanguagePickerSelect
              className={inputStyles['form-fieldset-field']}
              label={<FormattedMessage id="reportDesigner.selectLanguageLabel" defaultMessage="Language" description="Label for input to select language" />}
              selectedLanguage={currentLanguage}
              languages={JSON.parse(team.get_languages || '[]')}
              onSubmit={handleLanguageSubmit}
              isDisabled={props.pending || props.disabled}
            />
          </div>
        </div> : null
      }
      <div
        className={cx(
          styles['report-designer-form-container'],
          {
            [styles['report-designer-form-disabled']]: props.disabled,
          })
        }
      >
        <div className={inputStyles['form-fieldset']}>
          <div className={inputStyles['form-fieldset-title']}>
            <FormattedMessage id="reportDesigner.introductionTitle" defaultMessage="Introduction" description="Section title for the report introduction" />
          </div>
          <SwitchComponent
            className={inputStyles['form-fieldset-field']}
            label={
              <FormattedMessage
                data-testid="report-designer__introduction"
                id="reportDesigner.introduction"
                defaultMessage="Include Introduction with Report"
                description="Switch title to toggle on or off the report introduction"
              />
            }
            labelPlacement="end"
            checked={Boolean(data.use_introduction)}
            onChange={(enabled) => { props.onUpdate('use_introduction', enabled); }}
          />
          { data.use_introduction &&
            <FormattedMessage
              id="reportDesigner.introductionPlaceholder"
              defaultMessage="Add an introduction to this report"
              description="Placeholder for report introduction field"
            >
              { placeholder => (
                <TextArea
                  className={inputStyles['form-fieldset-field']}
                  autoGrow
                  key={`introduction-${data.language}`}
                  placeholder={placeholder}
                  label={
                    <FormattedMessage
                      id="reportDesigner.introductionInput"
                      defaultMessage="Introduction"
                      description="Text field label for the introduction input"
                    />
                  }
                  defaultValue={data.introduction}
                  onBlur={(e) => { props.onUpdate('introduction', e.target.value); }}
                  maxHeight="120px"
                  disabled={props.pending || props.disabled}
                  helpContent={
                    <FormattedMessage
                      id="reportDesigner.introductionSub"
                      defaultMessage="Use {query_date} placeholder to display the date of the original query. Use {status} to communicate the status of the article."
                      description="Help text on how to use the query date and status fields"
                      values={{
                        query_date: <strong>{'{{query_date}}'}</strong>,
                        status: <strong>{'{{status}}'}</strong>,
                      }}
                    />
                  }
                />
              )}
            </FormattedMessage>
          }
        </div>
      </div>
      <div
        className={cx(
          styles['report-designer-form-container'],
          {
            [styles['report-designer-form-disabled']]: props.disabled,
          })
        }
      >
        <div className={inputStyles['form-fieldset']}>
          <div className={inputStyles['form-fieldset-title']}>
            <FormattedMessage
              id="reportDesigner.report"
              defaultMessage="Fact-check"
              description="Section title for the fact-check form fields"
            />
            <ToggleButtonGroup
              className={inputStyles['form-fieldset-field']}
              variant="contained"
              onChange={(e, newValue) => {
                props.onUpdate({ use_text_message: newValue === 'text', use_visual_card: newValue === 'visual' });
              }}
              exclusive
            >
              <ToggleButton
                selected={Boolean(data.use_text_message)}
                value="text"
                key="text"
                className="int-report__button--report-type-text"
              >
                <FormattedMessage id="reportDesigner.text" defaultMessage="Text" description="Label used for radio button that toggles the report mode to text" />
              </ToggleButton>
              <ToggleButton
                selected={Boolean(data.use_visual_card) && !data.use_text_message}
                value="visual"
                key="visual"
                className="int-report__button--report-type-visual"
              >
                <FormattedMessage id="reportDesigner.visual" defaultMessage="Visual" description="Label used for radio button that toggles the report mode to visual" />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          { data.use_text_message ?
            <>
              <div className={inputStyles['form-fieldset-field']}>
                <FormattedMessage
                  id="reportDesigner.textTitlePlaceholder"
                  defaultMessage="Add a title to this report"
                  description="Placeholder for report title field"
                >
                  { placeholder => (
                    <LimitedTextArea
                      required={Boolean(false)}
                      value={data.title}
                      maxChars={140}
                      maxlength="140"
                      key={`text-title-${data.language}`}
                      rows={1}
                      label={
                        <FormattedMessage
                          id="reportDesigner.textTitle"
                          defaultMessage="Title"
                          description="Text field label for the report text title input"
                        />
                      }
                      disabled={props.pending || props.disabled}
                      autoGrow
                      placeholder={placeholder}
                      onBlur={(e) => {
                        const newValue = e.target.value;
                        props.onUpdate('title', newValue);
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
              <div className={inputStyles['form-fieldset-field']}>
                <FormattedMessage
                  id="reportDesigner.summaryPlaceholder"
                  defaultMessage="Briefly contextualize the report"
                  description="Placeholder instructions for report summary field"
                >
                  { placeholder => (
                    <LimitedTextArea
                      required={Boolean(false)}
                      value={data.text}
                      componentProps={{
                        id: 'report-designer__text',
                      }}
                      key={`text-${data.language}`}
                      name="summary"
                      maxChars={620}
                      maxlength="620"
                      rows={5}
                      label={
                        <FormattedMessage
                          id="reportDesigner.content"
                          defaultMessage="Summary"
                          description="Text field label for the report summary input"
                        />
                      }
                      autoGrow
                      disabled={props.pending || props.disabled}
                      placeholder={placeholder}
                      onBlur={(e) => {
                        const newValue = e.target.value;
                        props.onUpdate('text', newValue);
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
              <div className={inputStyles['form-fieldset-field']}>
                <FormattedMessage
                  id="reportDesigner.textURLPlaceholder"
                  defaultMessage="Add a URL to this report"
                  description="Placeholder for report url field"
                >
                  { placeholder => (
                    <LimitedTextArea
                      required={Boolean(false)}
                      value={data.published_article_url || ''}
                      componentProps={{
                        'data-testid': 'report-designer__text-url',
                      }}
                      maxChars={140}
                      maxlength="140"
                      key={`text-url-${data.language}-${data.published_article_url}`}
                      rows={1}
                      label={
                        <FormattedMessage
                          id="reportDesigner.textUrl"
                          defaultMessage="Article URL"
                          description="Text report field"
                        />
                      }
                      disabled={props.pending || props.disabled}
                      maxHeight="48px"
                      autoGrow="false"
                      placeholder={placeholder}
                      onBlur={(e) => {
                        const newValue = e.target.value;
                        let newUrl = newValue;
                        if (newValue.trim().length !== 0 && !/^https?:\/\//.test(newUrl)) {
                          newUrl = `https://${newUrl}`;
                        }
                        props.onUpdate('published_article_url', newUrl);
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
            </> : null
          }
          { data.use_visual_card && !data.use_text_message ?
            <>
              <ToggleButtonGroup
                key={`dark-overlay-${data.language}`}
                label={<FormattedMessage id="reportDesigner.theme" defaultMessage="Theme" description="Label used for choice on theme of report light versus dark" />}
                className={inputStyles['form-fieldset-field']}
                variant="contained"
                onChange={(e, newValue) => {
                  props.onUpdate('dark_overlay', Boolean(newValue));
                }}
                exclusive
              >
                <ToggleButton
                  selected={Boolean(!data.dark_overlay)}
                  value={Boolean(false)}
                  key="false"
                  className="int-report__button--report-theme-light"
                >
                  <FormattedMessage id="reportDesigner.lightTheme" defaultMessage="Light" description="Label used for button toggling on the light themed report" />
                </ToggleButton>
                <ToggleButton
                  selected={Boolean(data.dark_overlay)}
                  value={Boolean(true)}
                  key="true"
                  className="int-report__button--report-theme-dark"
                >
                  <FormattedMessage id="reportDesigner.darkTheme" defaultMessage="Dark" description="Label used for button toggling on the light themed report" />
                </ToggleButton>
              </ToggleButtonGroup>
              <div className={styles['report-rating-wrapper']}>
                <div className={styles['report-rating-headline']}>
                  <ColorPicker
                    color={data.theme_color}
                    onChange={handleChangeColor}
                  />
                  <FormattedMessage
                    id="reportDesigner.textStatusPlaceholder"
                    defaultMessage="Add a status to this report"
                    description="Placeholder for report status field"
                  >
                    { placeholder => (
                      <LimitedTextArea
                        required={Boolean(false)}
                        value={data.status_label}
                        maxChars={25}
                        maxlength="25"
                        key={`status-${data.language}`}
                        rows={1}
                        label={
                          <FormattedMessage
                            id="reportDesigner.statusLabel"
                            defaultMessage="Status label"
                            description="Text field label for the status of the report"
                          />
                        }
                        disabled={props.pending || props.disabled}
                        maxHeight="48px"
                        autoGrow="false"
                        placeholder={placeholder}
                        onBlur={(e) => {
                          const newValue = e.target.value;
                          props.onUpdate('status_label', newValue);
                        }}
                      />
                    )}
                  </FormattedMessage>
                  <FormattedMessage
                    id="reportDesigner.datePublishedPlaceholder"
                    defaultMessage="Add a date when this report was published"
                    description="Placeholder for report date published field"
                  >
                    { placeholder => (
                      <LimitedTextArea
                        required={Boolean(false)}
                        value={data.date || formatDate(new Date(), data.language)}
                        maxChars={100}
                        maxlength="100"
                        key={`date-${data.language}`}
                        rows={1}
                        label={
                          <FormattedMessage
                            id="reportDesigner.datePublished"
                            defaultMessage="Date published"
                            description="Text field label for the date the report was published"
                          />
                        }
                        disabled={props.pending || props.disabled}
                        maxHeight="48px"
                        autoGrow="false"
                        placeholder={placeholder}
                        onBlur={(e) => {
                          const newValue = e.target.value;
                          props.onUpdate('date', newValue);
                        }}
                      />
                    )}
                  </FormattedMessage>
                </div>
              </div>
              <div className={inputStyles['form-fieldset-field']}>
                <FormattedMessage
                  id="reportDesigner.headlinePlaceholder"
                  defaultMessage="Add a title to this report"
                  description="Placeholder for report title field"
                >
                  { placeholder => (
                    <LimitedTextArea
                      required={Boolean(false)}
                      value={data.headline}
                      maxChars={85}
                      maxlength="85"
                      key={`headline-${data.language}`}
                      rows={1}
                      label={
                        <FormattedMessage
                          id="reportDesigner.headline"
                          defaultMessage="Title"
                          description="Text field label for the report headline title input"
                        />
                      }
                      disabled={props.pending || props.disabled}
                      maxHeight="48px"
                      autoGrow="false"
                      placeholder={placeholder}
                      onBlur={(e) => {
                        const newValue = e.target.value;
                        props.onUpdate('headline', newValue);
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
              <div className={inputStyles['form-fieldset-field']}>
                <FormattedMessage
                  id="reportDesigner.visualSummaryPlaceholder"
                  defaultMessage="Briefly contextualize the report"
                  description="Placeholder instructions for visual report summary field"
                >
                  { placeholder => (
                    <LimitedTextArea
                      required={Boolean(false)}
                      value={data.description}
                      componentProps={{
                        id: 'report-designer__text',
                      }}
                      key={`description-${data.language}`}
                      name="summary"
                      maxChars={240}
                      maxlength="240"
                      rows={3}
                      label={
                        <FormattedMessage
                          id="reportDesigner.description"
                          defaultMessage="Summary"
                          description="Text field label for the report text summary input"
                        />
                      }
                      autoGrow
                      disabled={props.pending || props.disabled}
                      placeholder={placeholder}
                      onBlur={(e) => {
                        const newValue = e.target.value;
                        props.onUpdate('description', newValue);
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
              <div className={inputStyles['form-fieldset-field']}>
                <FormattedMessage
                  id="reportDesigner.visualURLPlaceholder"
                  defaultMessage="Add a URL to this report"
                  description="Placeholder for visual report url field"
                >
                  { placeholder => (
                    <LimitedTextArea
                      required={Boolean(false)}
                      value={data.url}
                      maxChars={40}
                      maxlength="40"
                      key={`url-${data.language}`}
                      rows={1}
                      label={
                        <FormattedMessage
                          id="reportDesigner.url"
                          defaultMessage="Website URL"
                          description="Text field label for the URL of the report website"
                        />
                      }
                      disabled={props.pending || props.disabled}
                      maxHeight="48px"
                      autoGrow="false"
                      placeholder={placeholder}
                      onBlur={(e) => {
                        const newValue = e.target.value;
                        props.onUpdate('url', newValue);
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
              <div className={inputStyles['form-fieldset-field']}>
                <UploadFile onChange={handleImageChange} onError={handleImageError} type="image" />
              </div>
              <div className={styles['report-image-buttons']}>
                { media.media.picture ?
                  <ButtonMain
                    onClick={handleDefaultImage}
                    variant="contained"
                    size="default"
                    theme="lightBrand"
                    disabled={media.media.picture === data.image}
                    label={
                      <FormattedMessage
                        id="reportDesigner.useDefaultImage"
                        defaultMessage="Use default image"
                        description="Button label to switch the report to use the default image"
                      />
                    }
                  /> : null }
                <ButtonMain
                  onClick={handleRemoveImage}
                  variant="contained"
                  size="default"
                  theme="brand"
                  label={
                    <FormattedMessage
                      id="reportDesigner.removeImage"
                      defaultMessage="Remove image"
                      description="Button label to remove the image from the report"
                    />
                  }
                />
              </div>
            </> : null
          }
        </div>
      </div>
    </div>
  );
};

ReportDesignerForm.defaultProps = {
  disabled: false,
  pending: false,
};

ReportDesignerForm.propTypes = {
  data: PropTypes.object.isRequired,
  media: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  pending: PropTypes.bool,
};

export default ReportDesignerForm;
