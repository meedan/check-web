import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Select from '../../cds/inputs/Select';
import LimitedTextField from '../../layout/inputs/LimitedTextField';
import Upload from '../../cds/inputs/Upload';
import inputStyles from '../../../styles/css/inputs.module.css';
import styles from './NewsletterComponent.module.css';

const messages = defineMessages({
  headerTypeNone: {
    id: 'newsletterHeader.headerTypeNone',
    defaultMessage: 'None',
    description: 'One of the options for a newsletter header type',
  },
  headerTypeLinkPreview: {
    id: 'newsletterHeader.headerTypeLinkPreview',
    defaultMessage: 'Link preview (requires a verified account on WhatsApp)',
    description: 'One of the options for a newsletter header type',
  },
  headerTypeImage: {
    id: 'newsletterHeader.headerTypeImage',
    defaultMessage: 'Image',
    description: 'One of the options for a newsletter header type',
  },
  headerTypeVideo: {
    id: 'newsletterHeader.headerTypeVideo',
    defaultMessage: 'Video',
    description: 'One of the options for a newsletter header type',
  },
  headerTypeAudio: {
    id: 'newsletterHeader.headerTypeAudio',
    defaultMessage: 'Audio',
    description: 'One of the options for a newsletter header type',
  },
});

const headerTypes = {
  none: messages.headerTypeNone,
  link_preview: messages.headerTypeLinkPreview,
  image: messages.headerTypeImage,
  video: messages.headerTypeVideo,
  audio: messages.headerTypeAudio,
};

const NewsletterHeader = ({
  availableHeaderTypes,
  disabled,
  error,
  file,
  fileName,
  handleFileChange,
  headerType,
  intl,
  onUpdateField,
  overlayText,
  parentErrors,
  setFile,
  setFileName,
}) => (
  <div className={inputStyles['form-fieldset-field']}>
    <Select
      className={styles.select}
      disabled={disabled}
      error={parentErrors.header_type || error}
      helpContent={
        parentErrors.header_type ?
          parentErrors.header_type
          :
          <FormattedMessage
            defaultMessage="Use a Header to send an image, video, or link to newsletter subscribers. Header images should be between 300 and 1600 pixels wide. We recommend the aspect ratio for header images be 1.91:1"
            description="Input help context for selecting a newsletter header"
            id="newsletterHeader.headerHelp"
          />
      }
      label={<FormattedMessage defaultMessage="Header" description="Label for the newsletter header type field" id="newsletterHeader.header" />}
      value={headerType}
      onChange={(e) => { onUpdateField('headerType', e.target.value); }}
    >
      {Object.keys(headerTypes).map(type => (
        <option disabled={!availableHeaderTypes.includes(type)} key={type} value={type}>
          {intl.formatMessage(headerTypes[type])}
        </option>
      ))}
    </Select>

    { (headerType === 'image' || headerType === 'video' || headerType === 'audio') ?
      <Upload
        className={styles.uploader}
        disabled={disabled}
        error={parentErrors.header_file || parentErrors.base}
        fileName={fileName}
        handleFileChange={handleFileChange}
        helpContent={parentErrors.header_file || parentErrors.base}
        setFile={setFile}
        setFileName={setFileName}
        type="image+video+audio"
        value={file}
      /> : null
    }
    { headerType === 'image' ?
      <FormattedMessage
        defaultMessage="Add text on top of the image"
        description="Placeholder text for a field where the user inputs text that is to be rendered on top of an image (i.e., an overlay)"
        id="newsletterHeader.overlayPlaceholder"
      >
        { placeholder => (
          <LimitedTextField
            disabled={disabled || (!file && !fileName)}
            label={<FormattedMessage
              defaultMessage="Text overlay"
              description="Label for a field where the user inputs text that is to be rendered on top of an image (i.e., an overlay)"
              id="newsletterHeader.overlay"
            />}
            maxChars={160}
            placeholder={placeholder}
            required={false}
            setValue={(value) => { onUpdateField('overlayText', value); }}
            value={overlayText}
          />
        )}
      </FormattedMessage> : null }
  </div>
);

NewsletterHeader.defaultProps = {
  disabled: false,
  availableHeaderTypes: [],
  headerType: 'none',
  overlayText: null,
  fileName: '',
  error: false,
};

NewsletterHeader.propTypes = {
  availableHeaderTypes: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  fileName: PropTypes.string,
  headerType: PropTypes.oneOf(['', 'none', 'link_preview', 'image', 'video', 'audio']),
  intl: intlShape.isRequired,
  overlayText: PropTypes.string,
  setFile: PropTypes.func.isRequired,
  setFileName: PropTypes.func.isRequired,
  onUpdateField: PropTypes.func.isRequired,
};

export default injectIntl(NewsletterHeader);
