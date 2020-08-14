import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/HelpOutline';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { SliderPicker } from 'react-color';
import ReportDesignerFormSection from './ReportDesignerFormSection';
import UploadFile from '../../UploadFile';
import { checkBlue } from '../../../styles/js/shared';

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
    background: 'white',
    opacity: 0.8,
    zIndex: 2,
  },
  helpIcon: {
    color: checkBlue,
  },
  colorPicker: {
    width: 400,
    margin: theme.spacing(3),
  },
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const ReportDesignerForm = (props) => {
  const classes = useStyles();
  const { data, media } = props;

  const handleHelp = () => {
    window.open('http://help.checkmedia.org/en/articles/3627266-check-message-report');
  };

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

  const textFieldProps = {
    className: classes.textField,
    variant: 'outlined',
    fullWidth: true,
  };

  return (
    <Box className={classes.root}>
      { props.disabled ? <Box className={classes.mask} /> : null }
      <Box display="flex" alignItems="center">
        <Typography variant="subtitle1">
          <FormattedMessage
            id="reportDesigner.reportEditorTitle"
            defaultMessage="Select the content to send in your report"
          />
        </Typography>
        <IconButton onClick={handleHelp}>
          <HelpIcon className={classes.helpIcon} />
        </IconButton>
      </Box>
      <Box>
        <ReportDesignerFormSection
          enabled={data.use_introduction}
          onToggle={(enabled) => { props.onUpdate('use_introduction', enabled); }}
          label={
            <FormattedMessage
              id="reportDesigner.introduction"
              defaultMessage="Introduction message"
            />
          }
        >
          <FormattedMessage
            id="reportDesigner.introductionPlaceholder"
            defaultMessage="Type your introduction here…"
          >
            {introductionPlaceholder => (
              <TextField
                key={`introduction-${data.language}`}
                value={data.introduction}
                onChange={(e) => { props.onUpdate('introduction', e.target.value); }}
                placeholder={introductionPlaceholder}
                rows={10}
                multiline
                {...textFieldProps}
              />
            )}
          </FormattedMessage>
          <Typography variant="caption">
            <FormattedMessage
              id="reportDesigner.introductionSub"
              defaultMessage="Use {query_date} placeholder to display the date of the original query. Use {status} to communicate the status of the article."
              values={{
                query_date: '{{query_date}}',
                status: '{{status}}',
              }}
            />
          </Typography>
        </ReportDesignerFormSection>

        <ReportDesignerFormSection
          enabled={data.use_visual_card}
          onToggle={(enabled) => { props.onUpdate('use_visual_card', enabled); }}
          label={
            <FormattedMessage
              id="reportDesigner.visualCard"
              defaultMessage="Report image"
            />
          }
        >
          <UploadFile onChange={handleImageChange} onError={handleImageError} type="image" />
          <Box>
            { media.media.picture ?
              <Button onClick={handleDefaultImage}>
                <FormattedMessage
                  id="reportDesigner.useDefaultImage"
                  defaultMessage="Use default image"
                />
              </Button> : null }
          </Box>
          <TextField
            key={`headline-${data.language}`}
            value={data.headline}
            onChange={(e) => { props.onUpdate('headline', e.target.value); }}
            inputProps={{ maxLength: 85 }}
            label={
              <FormattedMessage
                id="reportDesigner.headline"
                defaultMessage="Headline ({max} characters max)"
                values={{ max: 85 }}
              />
            }
            {...textFieldProps}
          />
          <TextField
            key={`description-${data.language}`}
            value={data.description}
            onChange={(e) => { props.onUpdate('description', e.target.value); }}
            inputProps={{ maxLength: 240 }}
            label={
              <FormattedMessage
                id="reportDesigner.description"
                defaultMessage="Description ({max} characters max)"
                values={{ max: 240 }}
              />
            }
            multiline
            rows={6}
            {...textFieldProps}
          />
          <TextField
            key={`status-${data.language}`}
            value={data.status_label}
            onChange={(e) => { props.onUpdate('status_label', e.target.value); }}
            inputProps={{ maxLength: 25 }}
            label={
              <FormattedMessage
                id="reportDesigner.statusLabel"
                defaultMessage="Status label ({max} characters max)"
                values={{ max: 25 }}
              />
            }
            {...textFieldProps}
          />
          <Box display="flex">
            <TextField
              key={`color-${data.language}`}
              value={data.theme_color}
              onChange={(e) => { props.onUpdate('theme_color', e.target.value); }}
              inputProps={{ maxLength: 7 }}
              label={
                <FormattedMessage
                  id="reportDesigner.themeColor"
                  defaultMessage="Theme color"
                />
              }
              {...textFieldProps}
            />
            <Box className={classes.colorPicker}>
              <SliderPicker
                color={data.theme_color}
                onChangeComplete={(color) => { props.onUpdate('theme_color', color.hex); }}
              />
            </Box>
          </Box>
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
              />
            }
          />
          <TextField
            key={`url-${data.language}`}
            value={data.url}
            onChange={(e) => { props.onUpdate('url', e.target.value); }}
            inputProps={{ maxLength: 40 }}
            label={
              <FormattedMessage
                id="reportDesigner.url"
                defaultMessage="URL ({max} characters max)"
                values={{ max: 40 }}
              />
            }
            {...textFieldProps}
          />
        </ReportDesignerFormSection>

        <ReportDesignerFormSection
          enabled={data.use_text_message}
          onToggle={(enabled) => { props.onUpdate('use_text_message', enabled); }}
          label={
            <FormattedMessage
              id="reportDesigner.textMessage"
              defaultMessage="Report text"
            />
          }
        >
          <FormattedMessage
            id="reportDesigner.textPlaceholder"
            defaultMessage="Type your report here…"
          >
            {textPlaceholder => (
              <TextField
                id="report-designer__text" // For integration test
                key={`text-${data.language}`}
                value={data.text}
                onChange={(e) => { props.onUpdate('text', e.target.value); }}
                placeholder={textPlaceholder}
                rows={10}
                multiline
                error={data.use_text_message && data.text.length === 0}
                helperText={
                  data.use_text_message && data.text.length === 0 ?
                    <FormattedMessage
                      id="reportDesigner.textError"
                      defaultMessage="You must either provide text for the report or uncheck the 'Report text' box"
                    /> : null
                }
                {...textFieldProps}
              />
            )}
          </FormattedMessage>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  key={`use-disclaimer-${data.language}`}
                  onChange={(e) => { props.onUpdate('use_disclaimer', e.target.checked); }}
                  checked={data.use_disclaimer}
                />
              }
              label={
                <FormattedMessage
                  id="reportDesigner.disclaimer"
                  defaultMessage="Disclaimer"
                />
              }
            />
          </Box>
          <TextField
            key={`disclaimer-${data.language}`}
            value={data.disclaimer}
            onChange={(e) => { props.onUpdate('disclaimer', e.target.value); }}
            {...textFieldProps}
          />
        </ReportDesignerFormSection>
      </Box>
    </Box>
  );
};

ReportDesignerForm.defaultProps = {
  disabled: false,
};

ReportDesignerForm.propTypes = {
  data: PropTypes.object.isRequired,
  media: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ReportDesignerForm;
