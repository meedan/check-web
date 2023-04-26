import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import styles from './NewsletterComponent.module.css';
import Select from '../../cds/inputs/Select';
import LimitedTextField from '../../layout/inputs/LimitedTextField';
import UploadFile from '../../UploadFile';

const messages = defineMessages({
  headerTypeNone: {
    id: 'newsletterHeader.headerTypeNone',
    defaultMessage: 'None',
    description: 'One of the options for a newsletter header type',
  },
  headerTypeLinkPreview: {
    id: 'newsletterHeader.headerTypeLinkPreview',
    defaultMessage: 'Link preview',
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
  headerType,
  overlayText,
  onUpdateField,
  intl,
}) => (
  <div>
    <Select label="Header" className={styles.select} value={headerType} onChange={(e) => { onUpdateField('headerType', e.target.value); }}>
      <option value="none">{intl.formatMessage(messages.headerTypeNone)}</option>
      <option value="link_preview">{intl.formatMessage(messages.headerTypeLinkPreview)}</option>
      <option value="image">{intl.formatMessage(messages.headerTypeImage)}</option>
      <option value="video">{intl.formatMessage(messages.headerTypeVideo)}</option>
      <option value="audio">{intl.formatMessage(messages.headerTypeAudio)}</option>
    </Select>

    { (headerType === 'image' || headerType === 'video' || headerType === 'audio') ?
      <UploadFile type="image+video+audio" /> : null }
    { headerType === 'image' ?
      <FormattedMessage
        id="newsletterHeader.overlayPlaceholder"
        defaultMessage="Add text on top of the image"
        description="Placeholder text for a field where the user inputs text that is to be rendered on top of an image (i.e., an overlay)"
      >
        { placeholder => (
          <LimitedTextField
            maxChars={160}
            value={overlayText}
            placeholder={placeholder}
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
  headerType: 'none',
  overlayText: null,
};

NewsletterHeader.propTypes = {
  headerType: PropTypes.oneOf(['none', 'link_preview', 'image', 'video', 'audio']),
  overlayText: PropTypes.string,
  onUpdateField: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(NewsletterHeader);
