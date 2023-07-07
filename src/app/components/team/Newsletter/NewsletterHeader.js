import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import styles from './NewsletterComponent.module.css';
import Select from '../../cds/inputs/Select';
import LimitedTextField from '../../layout/inputs/LimitedTextField';
import Upload from '../../cds/inputs/Upload';

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

const NewsletterHeader = ({
  disabled,
  availableHeaderTypes,
  error,
  headerType,
  handleFileChange,
  file,
  fileName,
  parentErrors,
  setFile,
  setFileName,
  overlayText,
  onUpdateField,
  intl,
}) => (
  <div>
    <Select
      label={<FormattedMessage id="newsletterHeader.header" defaultMessage="Header" description="Label for the newsletter header type field" />}
      className={styles.select}
      value={headerType}
      onChange={(e) => { onUpdateField('headerType', e.target.value); }}
      disabled={disabled}
      error={parentErrors.header_type || error}
      helpContent={parentErrors.header_type}
    >
      <option disabled={!availableHeaderTypes.includes('none')} value="none">{intl.formatMessage(messages.headerTypeNone)}</option>
      <option disabled={!availableHeaderTypes.includes('link_preview')} value="link_preview">{intl.formatMessage(messages.headerTypeLinkPreview)}</option>
      <option disabled={!availableHeaderTypes.includes('image')} value="image">{intl.formatMessage(messages.headerTypeImage)}</option>
      <option disabled={!availableHeaderTypes.includes('video')} value="video">{intl.formatMessage(messages.headerTypeVideo)}</option>
      <option disabled={!availableHeaderTypes.includes('audio')} value="audio">{intl.formatMessage(messages.headerTypeAudio)}</option>
    </Select>

    { (headerType === 'image' || headerType === 'video' || headerType === 'audio') ?
      <div className={styles.uploader}>
        <Upload
          type="image+video+audio"
          error={parentErrors.header_file || parentErrors.base}
          helpContent={parentErrors.header_file || parentErrors.base}
          disabled={disabled}
          handleFileChange={handleFileChange}
          fileName={fileName}
          setFile={setFile}
          setFileName={setFileName}
          value={file}
        />
      </div> : null
    }
    { headerType === 'image' ?
      <FormattedMessage
        id="newsletterHeader.overlayPlaceholder"
        defaultMessage="Add text on top of the image"
        description="Placeholder text for a field where the user inputs text that is to be rendered on top of an image (i.e., an overlay)"
      >
        { placeholder => (
          <LimitedTextField
            disabled={disabled || (!file && !fileName)}
            maxChars={160}
            value={overlayText}
            placeholder={placeholder}
            required={false}
            setValue={(value) => { onUpdateField('overlayText', value); }}
            label={<FormattedMessage
              id="newsletterHeader.overlay"
              defaultMessage="Text overlay"
              description="Label for a field where the user inputs text that is to be rendered on top of an image (i.e., an overlay)"
            />}
          />
        )}
      </FormattedMessage> : null }
  </div>
);

NewsletterHeader.defaultProps = {
  disabled: false,
  availableHeaderTypes: [],
  headerType: 'link_preview',
  overlayText: null,
  fileName: '',
  error: false,
};

NewsletterHeader.propTypes = {
  disabled: PropTypes.bool,
  availableHeaderTypes: PropTypes.arrayOf(PropTypes.string),
  headerType: PropTypes.oneOf(['', 'none', 'link_preview', 'image', 'video', 'audio']),
  setFile: PropTypes.func.isRequired,
  setFileName: PropTypes.func.isRequired,
  fileName: PropTypes.string,
  overlayText: PropTypes.string,
  onUpdateField: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  error: PropTypes.bool,
};

export default injectIntl(NewsletterHeader);
