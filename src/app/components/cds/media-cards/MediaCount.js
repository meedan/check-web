import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import MediaIcon from '../../../icons/perm_media.svg';
import MediaTypeDisplayIcon from '../../media/MediaTypeDisplayIcon';
import { getCompactNumber, getSeparatedNumber } from '../../../helpers';

const MediaCount = ({
  intl,
  mediaCount,
  mediaType,
}) => (
  <FormattedMessage id="sharedItemCard.medias" defaultMessage="Medias" description="This appears as a label next to a number, like '1,234 Medias'. It should indicate to the user that whatever number they are viewing represents the number of medias attached to an item .">
    { mediasLabel => (
      <Tooltip
        arrow
        title={`${getSeparatedNumber(intl.locale, mediaCount)} ${mediasLabel}`}
        placement="top"
      >
        <span>
          <ButtonMain
            disabled
            size="small"
            theme="brand"
            iconLeft={mediaCount === 1 && mediaType ? <MediaTypeDisplayIcon mediaType={mediaType} /> : <MediaIcon />}
            variant="contained"
            label={getCompactNumber(intl.locale, mediaCount)}
          />
        </span>
      </Tooltip>
    )}
  </FormattedMessage>
);

MediaCount.defaultProps = {
  mediaType: null,
};

MediaCount.propTypes = {
  intl: intlShape.isRequired,
  mediaCount: PropTypes.number.isRequired,
  mediaType: PropTypes.string,
};

export default injectIntl(MediaCount);
