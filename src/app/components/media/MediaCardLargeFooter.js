/* eslint-disable react/sort-prop-types */
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
  data,
  inModal,
  mediaType,
  onClickMore,
  projectMedia,
}) => {
  let footerTitle = null;

  const extractedText = projectMedia.extracted_text?.data?.text;
  if (extractedText) {
    footerTitle = (
      <FormattedMessage
        defaultMessage="Extracted text"
        description="Header for the OCR extracted text content of an image"
        id="mediaCardLargeFooter.extractedText"
      />
    );
  }

  let transcription = null;
  if (projectMedia.transcription?.data?.last_response.job_status === 'COMPLETED') {
    transcription = projectMedia.transcription?.data?.text;
  } else if (projectMedia.transcription?.data?.last_response.job_status === 'IN_PROGRESS') {
    transcription = (
      <FormattedMessage
        defaultMessage="Audio transcription in progress…"
        description="Label when transcription is in progress"
        id="mediaExpanded.transcriptionInProgress"
      />
    );
  }

  if (transcription) {
    footerTitle = (
      <FormattedMessage
        defaultMessage="Transcription"
        description="Header for the transcription content of an audio or video"
        id="mediaCardLargeFooter.transcription"
      />
    );
  }

  let footerBody = extractedText || transcription || null;
  if (projectMedia.type === 'Link' && inModal) footerBody = data.description;
  if (projectMedia.type === 'Claim' && inModal) footerBody = projectMedia.media.quote;

  const transcriptionOrExtractedFooter = (
    <MediaCardLargeFooterContent
      body={footerBody}
      showAll={inModal}
      title={footerTitle}
    />
  );

  return (
    <Box p={inModal ? 0 : 2}>
      { !inModal ?
        <Box mb={2}>
          <MediaSlug
            details={[(
              <FormattedMessage
                defaultMessage="Last submitted on {date}"
                description="Header for the date when the media item was last received by the workspace"
                id="mediaCardLarge.lastSeen"
                values={{
                  date: (
                    <FormattedDate
                      day="numeric"
                      month="short"
                      value={projectMedia.last_seen * 1000}
                      year="numeric"
                    />
                  ),
                }}
              />
            ), (
              <FormattedMessage
                defaultMessage="{count, plural, one {# request} other {# requests}}"
                description="Number of times a request has been sent about this media"
                id="mediaCardLarge.requests"
                values={{
                  count: projectMedia.requests_count,
                }}
              />
            )]}
            mediaType={mediaType}
            slug={projectMedia.media_slug || projectMedia.title}
          />
        </Box> : null }
      { projectMedia.type !== 'Claim' ?
        <Box my={2}>
          { /* 1st MediaLargeFooterContent, exclusive for Link, always displays URL above MediaCardLargeActions */}
          { projectMedia.type === 'Link' ?
            <MediaCardLargeFooterContent
              body={<ExternalLink url={data.url} />}
              title={
                data.published_at ? (
                  <FormattedMessage
                    defaultMessage="Published on {date}"
                    description="Publication date and time of a web article"
                    id="mediaCardLarge.publishedOn"
                    values={{
                      date: (
                        <FormattedDate
                          day="numeric"
                          month="short"
                          value={data.published_at}
                          year="numeric"
                        />
                      ),
                    }}
                  />
                ) : null
              }
            /> : '' }
        </Box> : null }
      { /* This MediaLargeFooterContent displays short preview textual content above MediaCardLargeActions */}
      { footerBody && !inModal ? <Box my={2}>{transcriptionOrExtractedFooter}</Box> : null }
      <MediaCardLargeActions
        bottomSeparator={inModal && footerBody && mediaType !== 'Claim'}
        inModal={inModal}
        projectMedia={projectMedia}
        onClickMore={onClickMore}
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
