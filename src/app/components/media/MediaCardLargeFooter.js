import React from 'react';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { Box } from '@material-ui/core';
import MediaCardLargeFooterContent from './MediaCardLargeFooterContent';
import MediaCardLargeActions from './MediaCardLargeActions';
import MediaSlug from './MediaSlug';
import ExternalLink from '../ExternalLink';

const MediaCardLargeFooter = ({
  inModal,
  projectMedia,
  onClickMore,
  mediaType,
  data,
}) => {
  let footerTitle = null;

  const extractedText = projectMedia.extracted_text?.data?.text;
  if (extractedText) {
    footerTitle = (
      <FormattedMessage
        id="mediaCardLargeFooter.extractedText"
        defaultMessage="Extracted text"
        description="Header for the OCR extracted text content of an image"
      />
    );
  }

  let transcription = null;
  if (projectMedia.transcription?.data?.last_response.job_status === 'COMPLETED') {
    transcription = projectMedia.transcription?.data?.text;
  } else if (projectMedia.transcription?.data?.last_response.job_status === 'IN_PROGRESS') {
    transcription = (
      <FormattedMessage
        id="mediaExpanded.transcriptionInProgress"
        defaultMessage="Audio transcription in progress…"
        description="Label when transcription is in progress"
      />
    );
  }

  if (transcription) {
    footerTitle = (
      <FormattedMessage
        id="mediaCardLargeFooter.transcription"
        defaultMessage="Transcription"
        description="Header for the transcription content of an audio or video"
      />
    );
  }

  let footerBody = extractedText || transcription || null;
  if (projectMedia.type === 'Link' && inModal) footerBody = data.description;
  if (projectMedia.type === 'Claim' && inModal) footerBody = projectMedia.media.quote;

  const transcriptionOrExtractedFooter = (
    <MediaCardLargeFooterContent
      title={footerTitle}
      body={footerBody}
      showAll={inModal}
    />
  );

  return (
    <Box p={inModal ? 0 : 2}>
      { !inModal ?
        <Box mb={2}>
          <MediaSlug
            mediaType={mediaType}
            slug={projectMedia.media_slug || projectMedia.title}
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
      { projectMedia.type !== 'Claim' ?
        <Box my={2}>
          { /* 1st MediaLargeFooterContent, exclusive for Link, always displays URL above MediaCardLargeActions */}
          { projectMedia.type === 'Link' ?
            <MediaCardLargeFooterContent
              title={
                data.published_at ? (
                  <FormattedMessage
                    id="mediaCardLarge.publishedOn"
                    defaultMessage="Published on {date}"
                    description="Publication date and time of a web article"
                    values={{
                      date: (
                        <FormattedDate
                          value={data.published_at}
                          year="numeric"
                          month="short"
                          day="numeric"
                        />
                      ),
                    }}
                  />
                ) : null
              }
              body={<ExternalLink url={data.url} />}
            /> : '' }
        </Box> : null }
      { /* This MediaLargeFooterContent displays short preview textual content above MediaCardLargeActions */}
      { footerBody && !inModal ? <Box my={2}>{transcriptionOrExtractedFooter}</Box> : null }
      <MediaCardLargeActions
        inModal={inModal}
        projectMedia={projectMedia}
        onClickMore={onClickMore}
        bottomSeparator={inModal && footerBody && mediaType !== 'Claim'}
      />
      { /* This MediaLargeFooterContent displays full-length textual content below MediaCardLargeActions */}
      { footerBody && inModal ? <Box mt={2}>{transcriptionOrExtractedFooter}</Box> : null }
    </Box>
  );
};

MediaCardLargeFooter.propTypes = {
  inModal: PropTypes.bool.isRequired,
  projectMedia: PropTypes.object.isRequired,
  onClickMore: PropTypes.func,
  mediaType: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

MediaCardLargeFooter.defaultProps = {
  onClickMore: null,
};

export default createFragmentContainer(MediaCardLargeFooter, graphql`
  fragment MediaCardLargeFooter_projectMedia on ProjectMedia {
    media_slug
    title
    last_seen
    requests_count
    type
    media {
      quote
    }
    extracted_text: annotation(annotation_type: "extracted_text") {
      data
    }
    transcription: annotation(annotation_type: "transcription") {
      data
    }
    ...MediaCardLargeActions_projectMedia
  }
`);
