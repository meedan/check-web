import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ItemThumbnail from './ItemThumbnail';
import Alert from '../alerts-and-prompts/Alert';
import ExternalLink from '../../ExternalLink';
import ParsedText from '../../ParsedText';
import MediaSlug from '../../media/MediaSlug';
import styles from './Card.module.css';

const SmallMediaCard = ({
  className, // { type, url, domain, quote, picture, metadata }
  description,
  details,
  ignoreGeneralContentMask,
  maskContent,
  media,
  onClick,
}) => {
  if (!media) {
    return (
      <Alert
        className={styles.alert}
        content={
          <FormattedMessage
            defaultMessage="Please reload the page and try again. Contact support if the error continues."
            description="Description for an error message that appears when media fails to load."
            id="smallMediaCard.noMediaDescription"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="There was an error loading the media for this card."
            description="Title for an error message that appears when media fails to load."
            id="smallMediaCard.noMediaTitle"
          />
        }
        variant="error"
      />
    );
  }

  return (
    <div
      className={cx(
        [styles.card],
        [styles.smallMediaCardWrapper],
        {
          [className]: true,
        })
      }
    >
      <div className={styles.smallMediaCard} onClick={onClick} onKeyDown={onClick}>
        <ItemThumbnail ignoreGeneralContentMask={ignoreGeneralContentMask} maskContent={maskContent} picture={media?.picture} size="small" type={media?.type} url={media?.url} />
        <div className={styles.smallMediaCardContent}>
          <div className={styles.titleAndUrl}>
            <div className={cx('typography-subtitle2', 'small-media-card__title', styles.row, (media.url ? styles.oneLineDescription : styles.twoLinesDescription))}>
              <ParsedText text={media.metadata?.title || media.quote || description} />
            </div>
            { media.url ?
              <div className={cx(styles.row, 'typography-body2')}>
                <ExternalLink readable url={media.url} />
              </div> : null
            }
          </div>
          <MediaSlug details={details} />
        </div>
      </div>
    </div>
  );
};

SmallMediaCard.propTypes = {
  className: PropTypes.string,
  description: PropTypes.string,
  details: PropTypes.array,
  ignoreGeneralContentMask: PropTypes.bool,
  maskContent: PropTypes.bool,
  media: PropTypes.shape({
    type: PropTypes.string.isRequired,
    url: PropTypes.string, // Mandatory for link
    domain: PropTypes.string, // Mandatory for link
    quote: PropTypes.string, // Mandatory for text claim
    picture: PropTypes.string, // URL to an image
    metadata: PropTypes.object,
  }).isRequired,
  onClick: PropTypes.func,
};

SmallMediaCard.defaultProps = {
  details: null,
  description: null,
  ignoreGeneralContentMask: false,
  maskContent: false,
  onClick: () => {},
  className: '',
};

// eslint-disable-next-line import/no-unused-modules
export { SmallMediaCard }; // Used in unit test
export default createFragmentContainer(SmallMediaCard, graphql`
  fragment SmallMediaCard_media on Media {
    type
    url
    quote
    picture
    metadata
  }
`);
