import React from 'react';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage, FormattedDate } from 'react-intl';
import cx from 'classnames/bind';
import MediaCardLargeFooterContent from './MediaCardLargeFooterContent';
import MediaCardLargeActions from './MediaCardLargeActions';
import MediaSlug from './MediaSlug';
import ExternalLink from '../ExternalLink';
import LastRequestDate from '../cds/media-cards/LastRequestDate';
import MediaIdentifier from '../cds/media-cards/MediaIdentifier';
import RequestsCount from '../cds/media-cards/RequestsCount';
import styles from './MediaCardLarge.module.css';

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
        defaultMessage="Transcription:"
        description="Header for the transcription content of an audio or video"
        id="mediaCardLargeFooter.transcription"
        tagName="strong"
      />
    );
  }

  let footerBody = extractedText || transcription || null;
  if (projectMedia.type === 'Link' && inModal) footerBody = data.description;
  if (projectMedia.type === 'Claim' && inModal) footerBody = projectMedia.media.quote;

  const transcriptionOrExtractedFooter = (
    <MediaCardLargeFooterContent
      body={footerBody}
      title={footerTitle}
    />
  );

  return (
    <div
      className={cx(
        styles['media-card-large-footer'],
        {
          [styles['media-card-large-footer-modal']]: inModal,
        })
      }
    >
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
                tagName="strong"
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
        />
        : null
      }
      { /* This MediaLargeFooterContent displays short preview textual content above MediaCardLargeActions */}
      { footerBody && !inModal ? <>{transcriptionOrExtractedFooter}</> : null }
      { !inModal ?
        <MediaSlug
          details={[(
            <LastRequestDate
              lastRequestDate={projectMedia.last_seen * 1000}
              theme="lightText"
              variant="text"
            />
          ), (
            <RequestsCount
              requestsCount={projectMedia.requests_count}
              theme="lightText"
              variant="text"
            />
          ), (
            <MediaIdentifier
              mediaType={mediaType}
              slug={projectMedia.media_slug || projectMedia.title}
              theme="lightText"
              variant="text"
            />
          ),
          ]}
        />
        : null
      }
      <MediaCardLargeActions
        bottomSeparator={inModal && footerBody && mediaType !== 'Claim'}
        inModal={inModal}
        projectMedia={projectMedia}
        onClickMore={onClickMore}
      />
      { /* This MediaLargeFooterContent displays full-length textual content below MediaCardLargeActions */}
      { footerBody && inModal ? <>{transcriptionOrExtractedFooter}</> : null }
    </div>
  );
};

MediaCardLargeFooter.propTypes = {
  data: PropTypes.object.isRequired,
  inModal: PropTypes.bool.isRequired,
  mediaType: PropTypes.string.isRequired,
  projectMedia: PropTypes.object.isRequired,
  onClickMore: PropTypes.func,
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
