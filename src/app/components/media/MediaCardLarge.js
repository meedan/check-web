import React from 'react';
import Relay from 'react-relay/classic';
import { graphql, createFragmentContainer, QueryRenderer } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import styled from 'styled-components';
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
import { otherWhite, brandBorder } from '../../styles/js/shared';

const StyledCardBorder = styled.div`
  background: ${otherWhite};
  border: ${props => props.inModal ? 'none' : `1px solid ${brandBorder}`};
  border-radius: ${props => props.roundedTopCorners ? '8px' : ' 0 0 8px 8px'};
`;

const MediaCardLarge = ({
  inModal,
  projectMedia,
  currentUserRole,
  onClickMore,
}) => {
  const { media } = projectMedia;
  const data = typeof media.metadata === 'string' ? JSON.parse(media.metadata) : media.metadata;

  let { type } = media;
  const isYoutube = media.url && media.domain === 'youtube.com';
  const isWebPage = media.url && data.provider === 'page';
  const isPender = media.url && data.provider !== 'page' && !isYoutube;
  const isBlank = media.type === 'Blank';
  type = getMediaType(media);

  const coverImage = media.thumbnail_path || '/images/player_cover.svg';

  return (
    <div className="media-card-large">
      <StyledCardBorder
        inModal={inModal}
        roundedTopCorners={type === 'Claim' || isBlank || isWebPage || isPender}
      >
        { type === 'Claim' && !inModal ? (
          <Box mt={2} mx={2}>
            <QuoteMediaCard
              showAll={inModal}
              quote={media.quote}
            />
          </Box>
        ) : null }
        { type === 'UploadedImage' ? (
          <ImageMediaCard
            projectMedia={projectMedia}
            imagePath={media.embed_path}
            currentUserRole={currentUserRole}
          />
        ) : null }
        { type === 'UploadedVideo' || type === 'UploadedAudio' || isYoutube ? (
          <MediaPlayerCard
            projectMedia={projectMedia}
            isYoutube={isYoutube}
            filePath={media.file_path || media.url}
            currentUserRole={currentUserRole}
            isAudio={type === 'UploadedAudio'}
            coverImage={coverImage}
          />
        ) : null }
        { isWebPage ? (
          <WebPageMediaCard
            projectMedia={projectMedia}
            currentUserRole={currentUserRole}
            data={data}
            inModal={inModal}
          />
        ) : null }
        { isPender ? (
          <PenderCard
            url={media.url}
            fallback={null}
            domId={`pender-card-${Math.floor(Math.random() * 1000000)}`}
            mediaVersion={data.refreshes_count}
          />
        ) : null }
        { isBlank ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            style={{ minHeight: 400 }}
          >
            <BlankMediaButton
              projectMediaId={projectMedia.id}
              team={projectMedia.team}
            />
          </Box>
        ) : null }

        { !isBlank ?
          <MediaCardLargeFooter
            inModal={inModal}
            projectMedia={projectMedia}
            onClickMore={onClickMore}
            mediaType={type}
            data={data}
          /> : null }
      </StyledCardBorder>
    </div>
  );
};

MediaCardLarge.propTypes = {
  projectMedia: PropTypes.object.isRequired, // Specifying a shape isn't needed now that we have a fragmentContainer ensuring all necessary fields are retrieved
  inModal: PropTypes.bool,
  currentUserRole: PropTypes.string.isRequired,
  onClickMore: PropTypes.func.isRequired,
};

MediaCardLarge.defaultProps = {
  inModal: false,
};

const MediaCardLargeContainer = createFragmentContainer(MediaCardLarge, graphql`
  fragment MediaCardLarge_projectMedia on ProjectMedia {
    id
    media {
      type
      domain
      url
      quote
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
        return (<MediasLoading count={1} />);
      }

      if (!error && props) {
        return <MediaCardLargeContainer inModal projectMedia={props.project_media} />;
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
  />
);

export default MediaCardLargeContainer;
export { MediaCardLargeQueryRenderer };
