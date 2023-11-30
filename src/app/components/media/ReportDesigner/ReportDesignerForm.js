import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import TextArea from '../../cds/inputs/TextArea';
import ReportDesignerFormSection from './ReportDesignerFormSection';
import ColorPicker from '../../layout/ColorPicker';
import UploadFile from '../../UploadFile';
import LanguagePickerSelect from '../../cds/inputs/LanguagePickerSelect';
import { formatDate } from './reportDesignerHelpers';
import LimitedTextFieldWithCounter from '../../layout/LimitedTextFieldWithCounter';
import { safelyParseJSON } from '../../../helpers';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
  },
  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--otherWhite)',
    opacity: 0.5,
    cursor: 'not-allowed',
    zIndex: 2,
  },
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  spacer: {
    width: theme.spacing(2),
  },
  card: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const ReportDesignerForm = (props) => {
  const classes = useStyles();
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
    className: classes.textField,
    variant: 'outlined',
    fullWidth: true,
    disabled: props.pending,
  };

  return (
    <Box className={classes.root}>
      { props.disabled ? <Box className={classes.mask} /> : null }
      { languages.length > 1 ?
        <LanguagePickerSelect
          label={<FormattedMessage id="reportDesigner.selectLanguageLabel" defaultMessage="Language" description="Label for input to select language" />}
          selectedLanguage={currentLanguage}
          languages={JSON.parse(team.get_languages || '[]')}
          onSubmit={handleLanguageSubmit}
        /> : null
      }
      <ReportDesignerFormSection
        enabled={Boolean(data.use_introduction)}
        onToggle={(enabled) => { props.onUpdate('use_introduction', enabled); }}
        label={
          <FormattedMessage
            data-testid="report-designer__introduction"
            id="reportDesigner.introduction"
            defaultMessage="Introduction"
            description="Section title for the report introduction"
          />
        }
      >
        <TextArea
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
      </ReportDesignerFormSection>

      <Card variant="outlined" className={classes.card}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <div className="typography-body1">
            <strong>
              <FormattedMessage
                id="reportDesigner.report"
                defaultMessage="Fact-check"
                description="Section title for the fact-check form fields"
              />
            </strong>
          </div>

          <Box>
            <FormControlLabel
              control={<Radio />}
              checked={Boolean(data.use_text_message)}
              label={<FormattedMessage id="reportDesigner.text" defaultMessage="Text" description="Label used for radio button that toggles the report mode to text" />}
              onChange={() => { props.onUpdate({ use_text_message: true, use_visual_card: false }); }}
            />
            {' '}
            <FormControlLabel
              control={<Radio />}
              checked={Boolean(data.use_visual_card) && !data.use_text_message}
              label={<FormattedMessage id="reportDesigner.visual" defaultMessage="Visual" description="Label used for radio button that toggles the report mode to visual" />}
              onChange={() => { props.onUpdate({ use_text_message: false, use_visual_card: true }); }}
            />
          </Box>
        </Box>

        { data.use_text_message ?
          <Box>
            <LimitedTextFieldWithCounter
              limit={140}
              label={
                <FormattedMessage
                  id="reportDesigner.textTitle"
                  defaultMessage="Title"
                  description="Text field label for the report text title input"
                />
              }
              onUpdate={(newValue) => { props.onUpdate('title', newValue); }}
              value={data.title}
              textFieldProps={{
                key: `text-title-${data.language}`,
                ...textFieldProps,
              }}
            />
            <LimitedTextFieldWithCounter
              limit={620}
              label={
                <FormattedMessage
                  id="reportDesigner.content"
                  defaultMessage="Summary"
                  description="Text field label for the report summary input"
                />
              }
              onUpdate={(newValue) => { props.onUpdate('text', newValue); }}
              rows={10}
              value={data.text}
              textFieldProps={{
                id: 'report-designer__text', // For integration test
                key: `text-${data.language}`,
                ...textFieldProps,
              }}
            />
            <LimitedTextFieldWithCounter
              limit={140}
              data-testid="report-designer__text-url"
              label={
                <FormattedMessage
                  id="reportDesigner.textUrl"
                  defaultMessage="Article URL"
                  description="Text report field"
                />
              }
              onUpdate={(newValue) => {
                let newUrl = newValue;
                if (newValue.trim().length !== 0 && !/^https?:\/\//.test(newUrl)) {
                  newUrl = `https://${newUrl}`;
                }
                props.onUpdate('published_article_url', newUrl);
              }}
              value={data.published_article_url}
              textFieldProps={{
                key: `text-url-${data.language}-${data.published_article_url}`,
                ...textFieldProps,
              }}
            />
          </Box> : null }

        { data.use_visual_card && !data.use_text_message ?
          <Box>
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
              <FormControlLabel
                control={
                  <Checkbox
                    key={`dark-overlay-${data.language}`}
                    onChange={(e) => { props.onUpdate('dark_overlay', e.target.checked); }}
                    checked={data.dark_overlay || false}
                  />
                }
                label={
                  <FormattedMessage
                    id="reportDesigner.darkOverlay"
                    defaultMessage="Dark overlay"
                    description="Check box label to indicate to user the dark overlay or not"
                  />
                }
              />
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
              <div className={classes.spacer} />
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
                  <div className={classes.spacer} />
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
          </Box> : null }
      </Card>
    </Box>
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
