/* eslint-disable relay/unused-fields */
/*
  FIXME: had to skip this relay/unused-fields rule unfortunately because of the team fragment that is needed
  for MediaStatusCommon (some 4 levels up the component tree) and is very difficult to
  make a proper chain of fragmentContainers at this moment because the BlankMediaButton
  is entangled in a few different places.
*/
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer, QueryRenderer } from 'react-relay/compat';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import MediaCardLargeFooter from './MediaCardLargeFooter';
import BlankMediaButton from './BlankMediaButton';
import MediaPlayerCard from './MediaPlayerCard';
import QuoteMediaCard from './QuoteMediaCard';
import ImageMediaCard from './ImageMediaCard';
import WebPageMediaCard from './WebPageMediaCard';
import PenderCard from './PenderCard';
import Loader from '../cds/loading/Loader';
import AspectRatio from '../layout/AspectRatio'; // eslint-disable-line no-unused-vars
import PushPinIcon from '../../icons/push_pin.svg';
import { getMediaType } from '../../helpers';
import ErrorBoundary from '../error/ErrorBoundary';
import styles from './MediaCardLarge.module.css';
import mediaStyles from './media.module.css';

const MediaCardLarge = ({
  currentUserRole,
  inModal,
  onClickMore,
  pinned,
  projectMedia,
  superAdminMask,
}) => {
  const { media } = projectMedia;
  const data = typeof media.metadata === 'string' ? JSON.parse(media.metadata) : media.metadata;

  // from https://github.com/cookpete/react-player/blob/a110aaf2f3f4e23a3ba3889fe9e8e7b96b769f59/src/patterns.js#L3
  const youtubeRegex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//;

  let { type } = media;
  const isYoutube = media.url && !!media.url.match(youtubeRegex);
  const isYoutubeChannel = !!media.url?.match(/youtube\.com\/(channel|c)\//);
  const isWebPage = media.url && data.provider === 'page';
  const isPender = media.url && data.provider !== 'page' && !isYoutube;
  const isBlank = media.type === 'Blank';
  type = getMediaType(media);

  const coverImage = media.thumbnail_path || '/images/player_cover.svg';

  return (
    <div
      className={cx(
        'media-card-large',
        styles['media-card-large'],
        {
          [styles['media-card-large-modal']]: inModal,
        })
      }
    >
      { type === 'Claim' && !inModal ? (
        <QuoteMediaCard
          quote={media.quote}
        />
      ) : null }
      { type === 'UploadedImage' ? (
        <ImageMediaCard
          currentUserRole={currentUserRole}
          imagePath={media.embed_path}
          projectMedia={projectMedia}
          superAdminMask={superAdminMask}
        />
      ) : null }
      { (type === 'UploadedVideo' || type === 'UploadedAudio' || isYoutube) && !isYoutubeChannel ? (
        <MediaPlayerCard
          coverImage={coverImage}
          currentUserRole={currentUserRole}
          filePath={media.file_path || media.url}
          isAudio={type === 'UploadedAudio'}
          isYoutube={isYoutube}
          projectMedia={projectMedia}
          superAdminMask={superAdminMask}
        />
      ) : null }
      { isWebPage && !isYoutube ? (
        <WebPageMediaCard
          currentUserRole={currentUserRole}
          data={data}
          inModal={inModal}
          projectMedia={projectMedia}
          superAdminMask={superAdminMask}
        />
      ) : null }
      { isPender ? (
        <AspectRatio
          className={styles['aspect-ratio-media-card']}
          currentUserRole={currentUserRole}
          isPenderCard={isPender}
          projectMedia={projectMedia}
          superAdminMask={superAdminMask}
        >
          <PenderCard
            domId={`pender-card-${Math.floor(Math.random() * 1000000)}`}
            fallback={null}
            mediaVersion={data.refreshes_count}
            url={media.url}
          />
        </AspectRatio>
      ) : null }
      { isBlank ? (
        <div className={styles['empty-media-card-large']}>
          <BlankMediaButton
            projectMediaId={projectMedia.id}
            team={projectMedia.team}
          />
        </div>
      ) : null }
      { !isBlank ?
        <div className={styles['media-card-large-meta']}>
          <div
            className={cx(
              styles['webpage-media-card-title-summary'],
              {
                [styles['webpage-media-card-title-summary-modal']]: inModal,
              })
            }
          >
            { data.title ?
              <div className={cx('media-card-large__title', styles['media-card-large-title'])}>
                { pinned && !inModal ?
                  <PushPinIcon /> : null }
                {data.title}
              </div> : null }
            { pinned && !data.title && !inModal ?
              <div className={mediaStyles['media-item-medias-header']}>
                <PushPinIcon />
                <FormattedMessage
                  defaultMessage="Pinned Media"
                  description="Title for the media in this list that is pinned to the top"
                  id="mediaComponent.pinnedMedia"
                />
              </div> : null }
            { data.description && !inModal ?
              <p>
                {data.description}
              </p> : null }
          </div>
          <MediaCardLargeFooter
            data={data}
            inModal={inModal}
            mediaType={type}
            projectMedia={projectMedia}
            onClickMore={onClickMore}
          />
        </div> : null }
    </div>
  );
};

MediaCardLarge.propTypes = {
  currentUserRole: PropTypes.string.isRequired,
  inModal: PropTypes.bool,
  pinned: PropTypes.bool,
  projectMedia: PropTypes.object.isRequired, // Specifying a shape isn't needed now that we have a fragmentContainer ensuring all necessary fields are retrieved
  superAdminMask: PropTypes.bool,
  onClickMore: PropTypes.func.isRequired,
};

MediaCardLarge.defaultProps = {
  inModal: false,
  pinned: true,
  superAdminMask: false,
};

const MediaCardLargeContainer = createFragmentContainer(MediaCardLarge, graphql`
  fragment MediaCardLarge_projectMedia on ProjectMedia {
    id
    team {
      id
      dbid
      slug
      verification_statuses
    }
    media {
      type
      url
      quote
      domain
      metadata
      embed_path
      file_path
      thumbnail_path
    }
    ...AspectRatio_projectMedia
    ...WebPageMediaCard_projectMedia
    ...MediaCardLargeFooter_projectMedia
  }
`);

const MediaCardLargeQueryRenderer = ({ projectMediaId }) => (
  <ErrorBoundary component="MediaCardLargeQueryRenderer">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MediaCardLargeQuery($ids: String!) {
          project_media(ids: $ids) {
            ...MediaCardLarge_projectMedia
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && !props) {
          return (<Loader size="small" theme="grey" variant="inline" />);
        }

        if (!error && props) {
          return <MediaCardLargeContainer inModal projectMedia={props.project_media} />;
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return null;
      }}
      variables={{
        ids: `${projectMediaId},,`,
      }}
    />
  </ErrorBoundary>
);

export default MediaCardLargeContainer;
export { MediaCardLargeQueryRenderer };
