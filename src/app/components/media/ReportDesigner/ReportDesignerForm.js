import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import cx from 'classnames/bind';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import TextArea from '../../cds/inputs/TextArea';
import { ToggleButton, ToggleButtonGroup } from '../../cds/inputs/ToggleButtonGroup';
import ColorPicker from '../../layout/ColorPicker';
import UploadFile from '../../UploadFile';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import LanguagePickerSelect from '../../cds/inputs/LanguagePickerSelect';
import { formatDate } from './reportDesignerHelpers';
import LimitedTextFieldWithCounter from '../../layout/LimitedTextFieldWithCounter';
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

  const textFieldProps = {
    fullWidth: true,
    disabled: props.pending,
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
            <TextArea
              className={inputStyles['form-fieldset-field']}
              autoGrow
              key={`introduction-${data.language}`}
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
              {...textFieldProps}
            />
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
          </div>
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
              className="int-report__button--report-type"
            >
              <FormattedMessage id="reportDesigner.text" defaultMessage="Text" description="Label used for radio button that toggles the report mode to text" />
            </ToggleButton>
            <ToggleButton
              selected={Boolean(data.use_visual_card) && !data.use_text_message}
              value="visual"
              key="visual"
              className="int-report__button--report-type"
            >
              <FormattedMessage id="reportDesigner.visual" defaultMessage="Visual" description="Label used for radio button that toggles the report mode to visual" />
            </ToggleButton>
          </ToggleButtonGroup>
          { data.use_visual_card && !data.use_text_message ?
            <SwitchComponent
              key={`dark-overlay-${data.language}`}
              className={inputStyles['form-fieldset-field']}
              label={
                <FormattedMessage
                  id="reportDesigner.darkOverlay"
                  defaultMessage="Dark overlay"
                  description="Check box label to indicate to user the dark overlay or not"
                />
              }
              labelPlacement="end"
              checked={data.dark_overlay || false}
              onChange={(e) => { props.onUpdate('dark_overlay', e); }}
            /> : null
          }
          { data.use_text_message ?
            <>
              <div className={inputStyles['form-fieldset-field']}>
                <FormattedMessage
                  id="reportDesigner.textTitlePlaceholder"
                  defaultMessage="Add a title to this report"
                  description="Placeholder url for report title field"
                >
                  { placeholder => (
                    <LimitedTextArea
                      required={Boolean(false)}
                      value={data.title}
                      componentProps={{
                        id: 'report-designer__text-url',
                      }}
                      maxChars={140}
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
                  description="Placeholder url for report summary field"
                >
                  { placeholder => (
                    <LimitedTextArea
                      required={Boolean(false)}
                      value={data.published_article_url}
                      componentProps={{
                        id: 'report-designer__text-url',
                      }}
                      maxChars={140}
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
            </> : null }

          { data.use_visual_card && !data.use_text_message ?
            <>
              <LimitedTextFieldWithCounter
                limit={85}
                label={
                  <FormattedMessage
                    id="reportDesigner.headline"
                    defaultMessage="Title"
                    description="Text field label for the report headline title input"
                  />
                }
                onUpdate={(newValue) => { props.onUpdate('headline', newValue); }}
                value={data.headline}
                textFieldProps={{
                  key: `headline-${data.language}`,
                  ...textFieldProps,
                }}
              />
              <LimitedTextFieldWithCounter
                limit={240}
                label={
                  <FormattedMessage
                    id="reportDesigner.description"
                    defaultMessage="Summary"
                    description="Text field label for the report text summary input"
                  />
                }
                onUpdate={(newValue) => { props.onUpdate('description', newValue); }}
                value={data.description}
                rows={3}
                textFieldProps={{
                  key: `description-${data.language}`,
                  ...textFieldProps,
                }}
              />
              <UploadFile onChange={handleImageChange} onError={handleImageError} type="image" />
              <Box display="flex" justifyContent="space-between">
                <Box display="flex">
                  { media.media.picture ?
                    <ButtonMain
                      onClick={handleDefaultImage}
                      variant="text"
                      size="default"
                      theme="text"
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
                    variant="text"
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
                </Box>
              </Box>
              <Box display="flex">
                <ColorPicker
                  color={data.theme_color}
                  onChange={handleChangeColor}
                />
                <Box display="flex" flexWrap="wrap" flexGrow="1">
                  <Box display="flex" width="100%">
                    <LimitedTextFieldWithCounter
                      limit={25}
                      value={data.status_label}
                      onUpdate={(newValue) => { props.onUpdate('status_label', newValue); }}
                      label={
                        <FormattedMessage
                          id="reportDesigner.statusLabel"
                          defaultMessage="Status label"
                          description="Text field label for the status of the report"
                        />
                      }
                      textFieldProps={{
                        key: `status-${data.language}`,
                        ...textFieldProps,
                      }}
                    />
                    <LimitedTextFieldWithCounter
                      limit={100}
                      value={data.date || formatDate(new Date(), data.language)}
                      onUpdate={(newValue) => { props.onUpdate('date', newValue); }}
                      label={
                        <FormattedMessage
                          id="reportDesigner.datePublished"
                          defaultMessage="Date published"
                          description="Text field label for the date the report was published"
                        />
                      }
                      textFieldProps={{
                        key: `date-${data.language}`,
                        ...textFieldProps,
                      }}
                    />
                  </Box>
                  <LimitedTextFieldWithCounter
                    limit={40}
                    value={data.url}
                    onUpdate={(newValue) => { props.onUpdate('url', newValue); }}
                    label={
                      <FormattedMessage
                        id="reportDesigner.url"
                        defaultMessage="Website URL"
                        description="Text field label for the URL of the report website"
                      />
                    }
                    textFieldProps={{
                      key: `url-${data.language}`,
                      ...textFieldProps,
                    }}
                  />
                </Box>
              </Box>
            </> : null }
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
