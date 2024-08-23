/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import { formatDate } from './reportDesignerHelpers';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import TextArea from '../../cds/inputs/TextArea';
import { ToggleButton, ToggleButtonGroup } from '../../cds/inputs/ToggleButtonGroup';
import ColorPicker from '../../cds/inputs/ColorPicker';
import UploadFile from '../../UploadFile';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import LanguagePickerSelect from '../../cds/inputs/LanguagePickerSelect';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';
import { safelyParseJSON } from '../../../helpers';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './ReportDesigner.module.css';

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
              <FormattedMessage defaultMessage="Report Language" description="Section title for the report language" id="reportDesigner.languageTitle" />
            </div>
            <LanguagePickerSelect
              className={inputStyles['form-fieldset-field']}
              isDisabled={props.pending || props.disabled}
              label={<FormattedMessage defaultMessage="Language" description="Label for input to select language" id="reportDesigner.selectLanguageLabel" />}
              languages={JSON.parse(team.get_languages || '[]')}
              selectedLanguage={currentLanguage}
              onSubmit={handleLanguageSubmit}
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
            <FormattedMessage defaultMessage="Introduction" description="Section title for the report introduction" id="reportDesigner.introductionTitle" />
          </div>
          <SwitchComponent
            checked={Boolean(data.use_introduction)}
            className={inputStyles['form-fieldset-field']}
            label={
              <FormattedMessage
                data-testid="report-designer__introduction"
                defaultMessage="Include Introduction with Report"
                description="Switch title to toggle on or off the report introduction"
                id="reportDesigner.introduction"
              />
            }
            labelPlacement="end"
            onChange={(enabled) => { props.onUpdate('use_introduction', enabled); }}
          />
          { data.use_introduction &&
            <FormattedMessage
              defaultMessage="Add an introduction to this report"
              description="Placeholder for report introduction field"
              id="reportDesigner.introductionPlaceholder"
            >
              { placeholder => (
                <TextArea
                  autoGrow
                  className={inputStyles['form-fieldset-field']}
                  defaultValue={data.introduction}
                  disabled={props.pending || props.disabled}
                  helpContent={
                    <FormattedMessage
                      defaultMessage="Use {query_date} placeholder to display the date of the original query. Use {status} to communicate the status of the article."
                      description="Help text on how to use the query date and status fields"
                      id="reportDesigner.introductionSub"
                      values={{
                        query_date: <strong>{'{{query_date}}'}</strong>,
                        status: <strong>{'{{status}}'}</strong>,
                      }}
                    />
                  }
                  key={`introduction-${data.language}`}
                  label={
                    <FormattedMessage
                      defaultMessage="Introduction"
                      description="Text field label for the introduction input"
                      id="reportDesigner.introductionInput"
                    />
                  }
                  maxHeight="120px"
                  placeholder={placeholder}
                  onBlur={(e) => { props.onUpdate('introduction', e.target.value); }}
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
              defaultMessage="Fact-check"
              description="Section title for the fact-check form fields"
              id="reportDesigner.report"
            />
            <ToggleButtonGroup
              className={inputStyles['form-fieldset-field']}
              exclusive
              variant="contained"
              onChange={(e, newValue) => {
                props.onUpdate({ use_text_message: newValue === 'text', use_visual_card: newValue === 'visual' });
              }}
            >
              <ToggleButton
                className="int-report__button--report-type-text"
                key="text"
                selected={Boolean(data.use_text_message)}
                value="text"
              >
                <FormattedMessage defaultMessage="Text" description="Label used for radio button that toggles the report mode to text" id="reportDesigner.text" />
              </ToggleButton>
              <ToggleButton
                className="int-report__button--report-type-visual"
                key="visual"
                selected={Boolean(data.use_visual_card) && !data.use_text_message}
                value="visual"
              >
                <FormattedMessage defaultMessage="Visual" description="Label used for radio button that toggles the report mode to visual" id="reportDesigner.visual" />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          { data.use_text_message ?
            <>
              <div className={inputStyles['form-fieldset-field']}>
                <FormattedMessage
                  defaultMessage="Add a title to this report"
                  description="Placeholder for report title field"
                  id="reportDesigner.textTitlePlaceholder"
                >
                  { placeholder => (
                    <LimitedTextArea
                      autoGrow
                      disabled={props.pending || props.disabled}
                      key={`text-title-${data.language}`}
                      label={
                        <FormattedMessage
                          defaultMessage="Title"
                          description="Text field label for the report text title input"
                          id="reportDesigner.textTitle"
                        />
                      }
                      maxChars={140}
                      maxlength="140"
                      placeholder={placeholder}
                      required={Boolean(false)}
                      rows={1}
                      value={data.title}
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
                  defaultMessage="Briefly contextualize the report"
                  description="Placeholder instructions for report summary field"
                  id="reportDesigner.summaryPlaceholder"
                >
                  { placeholder => (
                    <LimitedTextArea
                      autoGrow
                      componentProps={{
                        id: 'report-designer__text',
                      }}
                      disabled={props.pending || props.disabled}
                      key={`text-${data.language}`}
                      label={
                        <FormattedMessage
                          defaultMessage="Summary"
                          description="Text field label for the report summary input"
                          id="reportDesigner.content"
                        />
                      }
                      maxChars={620}
                      maxlength="620"
                      name="summary"
                      placeholder={placeholder}
                      required={Boolean(false)}
                      rows={5}
                      value={data.text}
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
                  defaultMessage="Add a URL to this report"
                  description="Placeholder for report url field"
                  id="reportDesigner.textURLPlaceholder"
                >
                  { placeholder => (
                    <LimitedTextArea
                      autoGrow="false"
                      componentProps={{
                        'data-testid': 'report-designer__text-url',
                      }}
                      disabled={props.pending || props.disabled}
                      key={`text-url-${data.language}-${data.published_article_url}`}
                      label={
                        <FormattedMessage
                          defaultMessage="Article URL"
                          description="Text report field"
                          id="reportDesigner.textUrl"
                        />
                      }
                      maxChars={140}
                      maxHeight="48px"
                      maxlength="140"
                      placeholder={placeholder}
                      required={Boolean(false)}
                      rows={1}
                      value={data.published_article_url || ''}
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
                className={inputStyles['form-fieldset-field']}
                exclusive
                key={`dark-overlay-${data.language}`}
                label={<FormattedMessage defaultMessage="Theme" description="Label used for choice on theme of report light versus dark" id="reportDesigner.theme" />}
                variant="contained"
                onChange={(e, newValue) => {
                  props.onUpdate('dark_overlay', Boolean(newValue));
                }}
              >
                <ToggleButton
                  className="int-report__button--report-theme-light"
                  key="false"
                  selected={Boolean(!data.dark_overlay)}
                  value={Boolean(false)}
                >
                  <FormattedMessage defaultMessage="Light" description="Label used for button toggling on the light themed report" id="reportDesigner.lightTheme" />
                </ToggleButton>
                <ToggleButton
                  className="int-report__button--report-theme-dark"
                  key="true"
                  selected={Boolean(data.dark_overlay)}
                  value={Boolean(true)}
                >
                  <FormattedMessage defaultMessage="Dark" description="Label used for button toggling on the light themed report" id="reportDesigner.darkTheme" />
                </ToggleButton>
              </ToggleButtonGroup>
              <div className={styles['report-rating-wrapper']}>
                <div className={styles['report-rating-headline']}>
                  <ColorPicker
                    color={data.theme_color}
                    onChange={handleChangeColor}
                  />
                  <FormattedMessage
                    defaultMessage="Add a status to this report"
                    description="Placeholder for report status field"
                    id="reportDesigner.textStatusPlaceholder"
                  >
                    { placeholder => (
                      <LimitedTextArea
                        autoGrow="false"
                        disabled={props.pending || props.disabled}
                        key={`status-${data.language}`}
                        label={
                          <FormattedMessage
                            defaultMessage="Status label"
                            description="Text field label for the status of the report"
                            id="reportDesigner.statusLabel"
                          />
                        }
                        maxChars={25}
                        maxHeight="48px"
                        maxlength="25"
                        placeholder={placeholder}
                        required={Boolean(false)}
                        rows={1}
                        value={data.status_label}
                        onBlur={(e) => {
                          const newValue = e.target.value;
                          props.onUpdate('status_label', newValue);
                        }}
                      />
                    )}
                  </FormattedMessage>
                  <FormattedMessage
                    defaultMessage="Add the report publication date"
                    description="Placeholder for report date published field"
                    id="reportDesigner.datePublishedPlaceholder"
                  >
                    { placeholder => (
                      <LimitedTextArea
                        autoGrow="false"
                        disabled={props.pending || props.disabled}
                        key={`date-${data.language}`}
                        label={
                          <FormattedMessage
                            defaultMessage="Date published"
                            description="Text field label for the date the report was published"
                            id="reportDesigner.datePublished"
                          />
                        }
                        maxChars={100}
                        maxHeight="48px"
                        maxlength="100"
                        placeholder={placeholder}
                        required={Boolean(false)}
                        rows={1}
                        value={data.date || formatDate(new Date(), data.language)}
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
                  defaultMessage="Add a title to this report"
                  description="Placeholder for report title field"
                  id="reportDesigner.headlinePlaceholder"
                >
                  { placeholder => (
                    <LimitedTextArea
                      autoGrow="false"
                      disabled={props.pending || props.disabled}
                      key={`headline-${data.language}`}
                      label={
                        <FormattedMessage
                          defaultMessage="Title"
                          description="Text field label for the report headline title input"
                          id="reportDesigner.headline"
                        />
                      }
                      maxChars={85}
                      maxHeight="48px"
                      maxlength="85"
                      placeholder={placeholder}
                      required={Boolean(false)}
                      rows={1}
                      value={data.headline}
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
                  defaultMessage="Briefly contextualize the report"
                  description="Placeholder instructions for visual report summary field"
                  id="reportDesigner.visualSummaryPlaceholder"
                >
                  { placeholder => (
                    <LimitedTextArea
                      autoGrow
                      componentProps={{
                        id: 'report-designer__text',
                      }}
                      disabled={props.pending || props.disabled}
                      key={`description-${data.language}`}
                      label={
                        <FormattedMessage
                          defaultMessage="Summary"
                          description="Text field label for the report text summary input"
                          id="reportDesigner.description"
                        />
                      }
                      maxChars={240}
                      maxlength="240"
                      name="summary"
                      placeholder={placeholder}
                      required={Boolean(false)}
                      rows={3}
                      value={data.description}
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
                  defaultMessage="Add a URL to this report"
                  description="Placeholder for visual report url field"
                  id="reportDesigner.visualURLPlaceholder"
                >
                  { placeholder => (
                    <LimitedTextArea
                      autoGrow="false"
                      disabled={props.pending || props.disabled}
                      key={`url-${data.language}`}
                      label={
                        <FormattedMessage
                          defaultMessage="Website URL"
                          description="Text field label for the URL of the report website"
                          id="reportDesigner.url"
                        />
                      }
                      maxChars={40}
                      maxHeight="48px"
                      maxlength="40"
                      placeholder={placeholder}
                      required={Boolean(false)}
                      rows={1}
                      value={data.url}
                      onBlur={(e) => {
                        const newValue = e.target.value;
                        props.onUpdate('url', newValue);
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
              <div className={inputStyles['form-fieldset-field']}>
                <UploadFile type="image" onChange={handleImageChange} onError={handleImageError} />
              </div>
              <div className={styles['report-image-buttons']}>
                { media.media.picture ?
                  <ButtonMain
                    disabled={media.media.picture === data.image}
                    label={
                      <FormattedMessage
                        defaultMessage="Use default image"
                        description="Button label to switch the report to use the default image"
                        id="reportDesigner.useDefaultImage"
                      />
                    }
                    size="default"
                    theme="lightInfo"
                    variant="contained"
                    onClick={handleDefaultImage}
                  /> : null }
                <ButtonMain
                  label={
                    <FormattedMessage
                      defaultMessage="Remove image"
                      description="Button label to remove the image from the report"
                      id="reportDesigner.removeImage"
                    />
                  }
                  size="default"
                  theme="info"
                  variant="contained"
                  onClick={handleRemoveImage}
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
