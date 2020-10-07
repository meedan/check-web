import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ReportDesignerFormSection from './ReportDesignerFormSection';
import ColorPicker from '../../layout/ColorPicker';
import UploadFile from '../../UploadFile';
import { formatDate } from './reportDesignerHelpers';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    marginTop: theme.spacing(2),
  },
  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'white',
    opacity: 0.5,
    cursor: 'not-allowed',
    zIndex: 2,
  },
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  headlineField: {
    fontWeight: 'bold',
  },
  spacer: {
    width: theme.spacing(2),
  },
}));

const ReportDesignerForm = (props) => {
  const classes = useStyles();
  const { data, media } = props;

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

  const textFieldProps = {
    className: classes.textField,
    variant: 'outlined',
    fullWidth: true,
  };

  return (
    <Box className={classes.root}>
      { props.disabled ? <Box className={classes.mask} /> : null }
      <Box>
        <ReportDesignerFormSection
          enabled={data.use_introduction}
          onToggle={(enabled) => { props.onUpdate('use_introduction', enabled); }}
          label={
            <FormattedMessage
              id="reportDesigner.introduction"
              defaultMessage="Introduction"
            />
          }
        >
          <Typography variant="body1">
            <FormattedMessage
              id="reportDesigner.introductionSub"
              defaultMessage="Use {query_date} placeholder to display the date of the original query. Use {status} to communicate the status of the article."
              values={{
                query_date: <strong>{'{{query_date}}'}</strong>,
                status: <strong>{'{{status}}'}</strong>,
              }}
            />
          </Typography>
          <TextField
            key={`introduction-${data.language}`}
            label={
              <FormattedMessage
                id="reportDesigner.introduction"
                defaultMessage="Introduction"
              />
            }
            value={data.introduction}
            onChange={(e) => { props.onUpdate('introduction', e.target.value); }}
            rows={4}
            multiline
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
          <TextField
            key={`text-title-${data.language}`}
            value={data.title}
            inputProps={{ maxLength: 140, className: classes.headlineField }}
            label={
              <FormattedMessage
                id="reportDesigner.textTitle"
                defaultMessage="Title ({max} characters max)"
                values={{ max: 140 }}
              />
            }
            onChange={(e) => { props.onUpdate('title', e.target.value); }}
            {...textFieldProps}
          />
          <TextField
            id="report-designer__text" // For integration test
            key={`text-${data.language}`}
            value={data.text}
            inputProps={{ maxLength: 760 }}
            label={
              <FormattedMessage
                id="reportDesigner.content"
                defaultMessage="Content ({max} characters max)"
                values={{ max: 760 }}
              />
            }
            onChange={(e) => { props.onUpdate('text', e.target.value); }}
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
          <TextField
            key={`disclaimer-${data.language}`}
            value={data.disclaimer}
            label={
              <FormattedMessage
                id="reportDesigner.disclaimer"
                defaultMessage="Disclaimer"
              />
            }
            onChange={(e) => {
              props.onUpdate('use_disclaimer', Boolean(e.target.value));
              props.onUpdate('disclaimer', e.target.value);
            }}
            {...textFieldProps}
          />
        </ReportDesignerFormSection>

        <ReportDesignerFormSection
          enabled={data.use_visual_card}
          onToggle={(enabled) => { props.onUpdate('use_visual_card', enabled); }}
          label={
            <FormattedMessage
              id="reportDesigner.visualCard"
              defaultMessage="Visual card"
            />
          }
        >
          <TextField
            key={`headline-${data.language}`}
            value={data.headline}
            onChange={(e) => { props.onUpdate('headline', e.target.value); }}
            inputProps={{ maxLength: 85, className: classes.headlineField }}
            label={
              <FormattedMessage
                id="reportDesigner.headline"
                defaultMessage="Title ({max} characters max)"
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
                defaultMessage="Content ({max} characters max)"
                values={{ max: 240 }}
              />
            }
            multiline
            rows={3}
            {...textFieldProps}
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
                />
              }
            />
            <Box>
              { media.media.picture ?
                <Button onClick={handleDefaultImage}>
                  <FormattedMessage
                    id="reportDesigner.useDefaultImage"
                    defaultMessage="Use default image"
                  />
                </Button> : null }
              <Button onClick={handleRemoveImage} color="primary">
                <FormattedMessage
                  id="reportDesigner.removeImage"
                  defaultMessage="Remove image"
                />
              </Button>
            </Box>
          </Box>
          <Box display="flex">
            <ColorPicker
              color={data.theme_color}
              onChange={color => props.onUpdate('theme_color', color.hex)}
            />
            <div className={classes.spacer} />
            <Box display="flex" flexWrap="wrap" flexGrow="1">
              <Box display="flex" width="100%">
                <TextField
                  key={`status-${data.language}`}
                  value={data.status_label}
                  onChange={(e) => { props.onUpdate('status_label', e.target.value); }}
                  inputProps={{ maxLength: 25 }}
                  fullWidth
                  label={
                    <FormattedMessage
                      id="reportDesigner.statusLabel"
                      defaultMessage="Status label ({max} characters max)"
                      values={{ max: 25 }}
                    />
                  }
                  {...textFieldProps}
                />
                <div className={classes.spacer} />
                <TextField
                  key={`date-${data.language}`}
                  value={data.date || formatDate(new Date(), data.language)}
                  onChange={(e) => { props.onUpdate('date', e.target.value); }}
                  inputProps={{ maxLength: 100 }}
                  fullWidth
                  label={
                    <FormattedMessage
                      id="reportDesigner.datePublished"
                      defaultMessage="Date published"
                    />
                  }
                  {...textFieldProps}
                />
              </Box>
              <TextField
                key={`url-${data.language}`}
                value={data.url}
                onChange={(e) => { props.onUpdate('url', e.target.value); }}
                inputProps={{ maxLength: 40 }}
                fullWidth
                label={
                  <FormattedMessage
                    id="reportDesigner.url"
                    defaultMessage="Website URL ({max} characters max)"
                    values={{ max: 40 }}
                  />
                }
                {...textFieldProps}
              />
            </Box>
          </Box>
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
