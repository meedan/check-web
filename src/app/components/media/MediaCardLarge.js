import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import styled from 'styled-components';
import MediaCardLargeFooterContent from './MediaCardLargeFooterContent';
import MediaExpandedActions from './MediaExpandedActions';
import MediaPlayerCard from './MediaPlayerCard';
import MediaSlug from './MediaSlug';
import QuoteMediaCard from './QuoteMediaCard';
import ImageMediaCard from './ImageMediaCard';
import WebPageMediaCard from './WebPageMediaCard';
import PenderCard from '../PenderCard';

const StyledCardBorder = styled.div`
  background: #fff;
  border: 1px solid #D0D6EC;
  border-radius: 0 0 16px 16px;
`;

const MediaCardLarge = ({
  // inModal, TODO: tweak layout according to inModal prop
  projectMedia,
}) => {
  console.log('projectMedia', projectMedia); // eslint-disable-line
  const { media } = projectMedia;
  const data = typeof media.metadata === 'string' ? JSON.parse(media.metadata) : media.metadata;

  let { type } = media;
  const isYoutube = media.url && media.domain === 'youtube.com';
  const isTwitter = media.url && media.domain === 'twitter.com';
  const isFacebook = media.url && media.domain === 'facebook.com';
  const isWebPage = media.url && data.provider === 'page';
  const isPender = media.url && data.provider !== 'page' && !isYoutube;
  if (isYoutube) type = 'Youtube';
  if (isTwitter) type = 'Twitter';
  if (isFacebook) type = 'Facebook';

  const extractedText = projectMedia.extracted_text?.data?.text;
  const transcription = projectMedia.transcription?.data.text;

  return (
    <>
      <StyledCardBorder>
        { type === 'Claim' ? (
          <Box mt={2} mx={2}>
            <QuoteMediaCard quote={media.quote} />
          </Box>
        ) : null }
        { type === 'UploadedImage' ? (
          <ImageMediaCard
            imagePath={media.embed_path}
          />
        ) : null }
        { type === 'UploadedVideo' || type === 'UploadedAudio' || isYoutube ? (
          <MediaPlayerCard
            isYoutube={isYoutube}
            filePath={media.file_path || media.url}
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

        <Box p={2}>
          <Box mb={2}>
            <MediaSlug
              mediaType={type}
              slug={`${type}-${projectMedia.team.slug}-${projectMedia.dbid}`}
              details={[`Last submitted on ${projectMedia.last_seen}`, '25 requests']}
            />
          </Box>
          <MediaExpandedActions projectMedia={projectMedia} />
          <Box mt={2}>
            <MediaCardLargeFooterContent
              type="Transcription"
              body="Hello World"
            />
          </Box>
        </Box>
      </StyledCardBorder>
    </>
  );
};

MediaCardLarge.propTypes = {
  projectMedia: PropTypes.shape({

  }).isRequired,
};

export default createFragmentContainer(MediaCardLarge, graphql`
  fragment MediaCardLarge_projectMedia on ProjectMedia {
    dbid
    ...WebPageMediaCard_projectMedia
    ...MediaExpandedActions_projectMedia
    last_seen
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
    }
    team {
      slug
    }
  }
`);
