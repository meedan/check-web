import React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import Relay from 'react-relay/classic';
import { graphql, createFragmentContainer, QueryRenderer } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import styled from 'styled-components';
import BlankMediaButton from './BlankMediaButton';
import MediaCardLargeFooterContent from './MediaCardLargeFooterContent';
import MediaExpandedActions from './MediaExpandedActions';
import MediasLoading from './MediasLoading';
import MediaPlayerCard from './MediaPlayerCard';
import MediaSlug from './MediaSlug';
import QuoteMediaCard from './QuoteMediaCard';
import ImageMediaCard from './ImageMediaCard';
import WebPageMediaCard from './WebPageMediaCard';
import PenderCard from '../PenderCard';
import AspectRatio from '../layout/AspectRatio'; // eslint-disable-line no-unused-vars
import { getMediaType } from '../../helpers';

const StyledCardBorder = styled.div`
  background: #fff;
  border: ${props => props.inModal ? 'none' : '1px solid #D0D6EC'};
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

  const extractedText = projectMedia.extracted_text?.data?.text;
  const transcription = projectMedia.transcription?.data.text;

  let footerType = null;
  if (extractedText) footerType = 'ExtractedText';
  if (transcription) footerType = 'Transcription';
  const footerBody = extractedText || transcription || null;

  return (
    <div className="media-card-large">
      <StyledCardBorder
        inModal={inModal}
        roundedTopCorners={type === 'Claim' || isBlank || isWebPage || isPender}
      >
        { type === 'Claim' ? (
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
            data={data}
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

        <Box p={2}>
          { !inModal ?
            <Box mb={2}>
              <MediaSlug
                mediaType={type}
                slug={projectMedia.title}
                details={[(
                  <FormattedMessage
                    id="mediaCardLarge.lastSeen"
                    defaultMessage="Last submitted on {date}"
                    description="Header for the date when the media item was last received by the workspace"
                    values={{
                      date: (
                        <FormattedDate
                          value={projectMedia.last_seen * 1000}
                          year="numeric"
                          month="short"
                          day="numeric"
                        />
                      ),
                    }}
                  />
                ), (
                  <FormattedMessage
                    id="mediaCardLarge.requests"
                    defaultMessage="{count, plural, one {# request} other {# requests}}"
                    description="Number of times a request has been sent about this media"
                    values={{
                      count: projectMedia.requests_count,
                    }}
                  />
                )]}
              />
            </Box> : null }
          <MediaExpandedActions
            inModal={inModal}
            projectMedia={projectMedia}
            onClickMore={onClickMore}
          />
          { footerBody ? (
            <Box mt={2}>
              <MediaCardLargeFooterContent
                type={footerType}
                body={footerBody}
              />
            </Box>
          ) : null }
        </Box>
      </StyledCardBorder>
    </div>
  );
};

MediaCardLarge.propTypes = {
  projectMedia: PropTypes.shape({

  }).isRequired,
};

const MediaCardLargeContainer = createFragmentContainer(MediaCardLarge, graphql`
  fragment MediaCardLarge_projectMedia on ProjectMedia {
    id
    title
    ...AspectRatio_projectMedia
    ...WebPageMediaCard_projectMedia
    ...MediaExpandedActions_projectMedia
    last_seen
    requests_count
    extracted_text: annotation(annotation_type: "extracted_text") {
      data
    }
    transcription: annotation(annotation_type: "transcription") {
      data
    }
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
