import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import Alert from '../alerts-and-prompts/Alert';
import ExternalLink from '../../ExternalLink';
import ParsedText from '../../ParsedText';
import MediaSlug from '../../media/MediaSlug';
import ItemThumbnail from './ItemThumbnail';
import { getMediaType } from '../../../helpers';
import styles from './Card.module.css';

const SmallMediaCard = ({
  media, // { type, url, domain, quote, picture, metadata }
  customTitle,
  details,
  description,
  maskContent,
  superAdminMask,
  onClick,
  className,
}) => {
  if (!media) {
    return (
      <Alert
        className={styles.alert}
        title={
          <FormattedMessage
            id="smallMediaCard.noMediaTitle"
            defaultMessage="There was an error loading the media for this card."
            description="Title for an error message that appears when media fails to load."
          />
        }
        content={
          <FormattedMessage
            id="smallMediaCard.noMediaDescription"
            defaultMessage="Please reload the page and try again. Contact support if the error continues."
            description="Description for an error message that appears when media fails to load."
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
        <ItemThumbnail picture={media?.picture} maskContent={maskContent || superAdminMask} type={media?.type} url={media?.url} />
        <div className={styles.smallMediaCardContent}>
          <div className={styles.titleAndUrl}>
            <div className={cx('typography-subtitle2', styles.row, (media.url ? styles.oneLineDescription : styles.twoLinesDescription))}>
              <ParsedText text={media.metadata?.title || media.quote || description} />
            </div>
            { media.url ?
              <div className={cx(styles.row, 'typography-body2')}>
                <ExternalLink url={media.url} maxUrlLength={60} readable />
              </div> : null
            }
          </div>
          <MediaSlug
            mediaType={getMediaType({ type: media.type, url: media.url, domain: media.domain })}
            slug={customTitle || media.metadata?.title}
            details={details}
          />
        </div>
      </div>
    </div>
  );
};

SmallMediaCard.propTypes = {
  media: PropTypes.shape({
    type: PropTypes.string.isRequired,
    url: PropTypes.string, // Mandatory for link
    domain: PropTypes.string, // Mandatory for link
    quote: PropTypes.string, // Mandatory for text claim
    picture: PropTypes.string, // URL to an image
    metadata: PropTypes.object,
  }).isRequired,
  customTitle: PropTypes.string,
  details: PropTypes.array,
  description: PropTypes.string,
  maskContent: PropTypes.bool,
  superAdminMask: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

SmallMediaCard.defaultProps = {
  customTitle: null,
  details: null,
  description: null,
  maskContent: false,
  superAdminMask: false,
  onClick: () => {},
  className: '',
};

// eslint-disable-next-line import/no-unused-modules
export { SmallMediaCard }; // Used in unit test
export default createFragmentContainer(SmallMediaCard, graphql`
  fragment SmallMediaCard_media on Media {
    type
    url
    domain
    quote
    picture
    metadata
  }
`);
