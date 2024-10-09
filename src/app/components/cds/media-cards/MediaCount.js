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
    defaultMessage="{mediaCount, plural, one {# Media} other {{mediaCount, number} Media}} in Cluster"
    // {mediaCount, number} tells react-intl to format the number as Intl.NumberFormat(locale, {})
    description="A count of media in a cluster of media. Title-case where applicable. Example: 3 Media. In English we prefer Media for both singular and plural"
    id="sharedItemCard.medias"
    values={{ mediaCount }}
  >
    { mediaLabel => (
      <Tooltip
        arrow
        placement="top"
        title={mediaLabel}
      >
        <span>
          <ButtonMain
            buttonProps={{
              type: null,
            }}
            disabled
            iconLeft={mediaCount === 1 && mediaType ? <MediaTypeDisplayIcon color="unset" fontSize="unset" mediaType={mediaType} /> : <MediaIcon />}
            label={getCompactNumber(intl.locale, mediaCount)}
            size="small"
            theme="lightBeige"
            variant={mediaCount === 0 ? 'text' : 'contained'}
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
