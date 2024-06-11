import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import MediaIcon from '../../../icons/perm_media.svg';
import MediaTypeDisplayIcon from '../../media/MediaTypeDisplayIcon';
import { getCompactNumber } from '../../../helpers';

const MediaCount = ({
  intl,
  mediaCount,
  mediaType,
}) => (
  <FormattedMessage
    id="sharedItemCard.medias"
    // {mediaCount, number} tells react-intl to format the number as Intl.NumberFormat(locale, {})
    defaultMessage="{mediaCount, plural, one {# Media} other {{mediaCount, number} Media}}"
    description="A count of media in an item. Title-case where applicable. Example: 3 Media. In English we prefer Media for both singular and plural"
    values={{ mediaCount }}
  >
    { mediaLabel => (
      <Tooltip
        arrow
        title={mediaLabel}
        placement="top"
      >
        <span>
          <ButtonMain
            disabled
            size="small"
            theme="lightBeige"
            iconLeft={mediaCount === 1 && mediaType ? <MediaTypeDisplayIcon mediaType={mediaType} fontSize="unset" color="unset" /> : <MediaIcon />}
            variant="contained"
            label={getCompactNumber(intl.locale, mediaCount)}
            buttonProps={{
              type: null,
            }}
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
