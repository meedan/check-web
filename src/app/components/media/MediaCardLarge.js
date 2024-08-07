/* eslint-disable relay/unused-fields */
/*
  FIXME: had to skip this relay/unused-fields rule unfortunately because of the team fragment that is needed
  for MediaStatusCommon (some 4 levels up the component tree) and is very difficult to
  make a proper chain of fragmentContainers at this moment because the BlankMediaButton
  is entangled in a few different places.
*/
import React from 'react';
import Relay from 'react-relay/classic';
import { graphql, createFragmentContainer, QueryRenderer } from 'react-relay/compat';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import MediaCardLargeFooter from './MediaCardLargeFooter';
import BlankMediaButton from './BlankMediaButton';
import MediasLoading from './MediasLoading';
import MediaPlayerCard from './MediaPlayerCard';
import QuoteMediaCard from './QuoteMediaCard';
import ImageMediaCard from './ImageMediaCard';
import WebPageMediaCard from './WebPageMediaCard';
import PenderCard from '../PenderCard';
import AspectRatio from '../layout/AspectRatio'; // eslint-disable-line no-unused-vars
import { getMediaType } from '../../helpers';
import styles from './media.module.css';
import ErrorBoundary from '../error/ErrorBoundary';

const MediaCardLarge = ({
  inModal,
  projectMedia,
  currentUserRole,
  superAdminMask,
  onClickMore,
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
        styles['media-card-large-border'],
        {
          [styles['rounded-top-corners']]: (type === 'Claim' || isBlank || isWebPage || isPender),
          [styles['no-border']]: inModal || !(type === 'Claim' || isBlank || isWebPage || isPender),
          [styles['no-outline']]: inModal || (type === 'Claim' || isBlank || isWebPage || isPender),
        })
      }
    >
      { type === 'Claim' && !inModal ? (
        <div className={styles['quote-mediacard-wrapper']}>
          <QuoteMediaCard
            showAll={inModal}
            quote={media.quote}
          />
        </div>
      ) : null }
      { type === 'UploadedImage' ? (
        <ImageMediaCard
          projectMedia={projectMedia}
          imagePath={media.embed_path}
          currentUserRole={currentUserRole}
          superAdminMask={superAdminMask}
        />
      ) : null }
      { (type === 'UploadedVideo' || type === 'UploadedAudio' || isYoutube) && !isYoutubeChannel ? (
        <MediaPlayerCard
          projectMedia={projectMedia}
          isYoutube={isYoutube}
          filePath={media.file_path || media.url}
          currentUserRole={currentUserRole}
          isAudio={type === 'UploadedAudio'}
          coverImage={coverImage}
          superAdminMask={superAdminMask}
        />
      ) : null }
      { isWebPage && !isYoutube ? (
        <WebPageMediaCard
          projectMedia={projectMedia}
          currentUserRole={currentUserRole}
          data={data}
          inModal={inModal}
          superAdminMask={superAdminMask}
        />
      ) : null }
      { isPender ? (
        <AspectRatio
          projectMedia={projectMedia}
          currentUserRole={currentUserRole}
          superAdminMask={superAdminMask}
          isPenderCard={isPender}
        >
          <PenderCard
            url={media.url}
            fallback={null}
            domId={`pender-card-${Math.floor(Math.random() * 1000000)}`}
            mediaVersion={data.refreshes_count}
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
        <MediaCardLargeFooter
          inModal={inModal}
          projectMedia={projectMedia}
          onClickMore={onClickMore}
          mediaType={type}
          data={data}
        /> : null }
    </div>
  );
};

MediaCardLarge.propTypes = {
  projectMedia: PropTypes.object.isRequired, // Specifying a shape isn't needed now that we have a fragmentContainer ensuring all necessary fields are retrieved
  inModal: PropTypes.bool,
  currentUserRole: PropTypes.string.isRequired,
  onClickMore: PropTypes.func.isRequired,
  superAdminMask: PropTypes.bool,
};

MediaCardLarge.defaultProps = {
  inModal: false,
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
      variables={{
        ids: `${projectMediaId},,`,
      }}
      render={({ error, props }) => {
        if (!error && !props) {
          return (<MediasLoading theme="grey" variant="inline" size="small" />);
        }

        if (!error && props) {
          return <MediaCardLargeContainer inModal projectMedia={props.project_media} />;
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return null;
      }}
    />
  </ErrorBoundary>
);

export default MediaCardLargeContainer;
export { MediaCardLargeQueryRenderer };
