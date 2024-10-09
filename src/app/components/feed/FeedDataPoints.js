import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import FeedDataPointsSection from './FeedDataPointsSection';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';
import Alert from '../cds/alerts-and-prompts/Alert';
import { stringHelper } from '../../customHelpers';
import styles from './SaveFeed.module.css';

const FeedDataPoints = ({ dataPoints, onChange, readOnly }) => {
  const toggleDataPoint = (enabled, dataPoint) => {
    const newDataPoints = dataPoints.filter(x => x !== dataPoint);
    if (enabled) {
      newDataPoints.push(dataPoint);
    }
    onChange(newDataPoints);
  };

  return (
    <div className={styles.dataPointsCard}>
      <div className="typography-subtitle2">
        <div className={styles.dataPointsTitle}>
          <FormattedMessage
            defaultMessage="What workspace data will be shared in this feed?"
            description="Title of section where the data points being shared in a feed can be selected."
            id="feedDataPoints.title"
          />
        </div>
        { readOnly ?
          <Alert
            content={
              <FormattedMessage
                defaultMessage="Contact {checkSupportLink} to make adjustments to the workspace data of this shared feed."
                description="Description of the alert message displayed on data points section of the edit feed page."
                id="feedDataPoints.readOnlyAlertContent"
                values={{
                  checkSupportLink: (
                    <a href={`mailto:${stringHelper('SUPPORT_EMAIL')}`}>
                      <FormattedMessage
                        defaultMessage="Check Support"
                        description="Text of the contact support link displayed on the alert box of the data points section in the edit feed page."
                        id="feedDataPoints.contactSupportLinkText"
                      />
                    </a>
                  ),
                }}
              />
            }
            title={
              <FormattedMessage
                defaultMessage="This shared feed already contains data from other collaborators."
                description="Title of the alert message displayed on data points section of the edit feed page."
                id="feedDataPoints.readOnlyAlertTitle"
              />
            }
            variant="warning"
          />
          : null
        }
        <FeedDataPointsSection
          content={
            <>
              <FormattedHTMLMessage
                defaultMessage="<strong>Published Claim & Fact-Check</strong> data to be shared:"
                description="Title of the content section on save feed page where a user can select that fact-checks will be shared in this feed."
                id="feedDataPoints.factChecksContentTitle"
              />
              <ul>
                <FormattedMessage
                  defaultMessage="Claim"
                  description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  id="feedDataPoints.feedDataPointClaim"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Fact-Check title"
                  description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  id="feedDataPoints.feedDataPointTitle"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Fact-Check description"
                  description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  id="feedDataPoints.feedDataPointDescription"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Date published"
                  description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  id="feedDataPoints.feedDataPointDataPublished"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Language"
                  description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  id="feedDataPoints.feedDataPointLanguage"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Rating"
                  description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  id="feedDataPoints.feedDataPointRating"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Article URL"
                  description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  id="feedDataPoints.feedDataPointArticleUrl"
                  tagName="li"
                />
              </ul>
              <div className="typography-body2">
                <FormattedMessage
                  defaultMessage="Learn more about {factCheckDataArticleLink}."
                  description="Footer of section on save feed page where a user can select that claim & fact-checks will be shared in this feed."
                  id="feedDataPoints.factChecksContentFooter"
                  values={{
                    factCheckDataArticleLink: (
                      <a href="https://help.checkmedia.org/en/articles/8542417-shared-feed-creation#h_7414a7ab59" rel="noopener noreferrer" target="_blank"> {/* FIXME: Put the correct link here */}
                        <FormattedMessage
                          defaultMessage="claim & fact-check data"
                          description="Text of the link to an article that explains fact-check data. This link is displayed on the fact-check data points section on the save feed page."
                          id="feedDataPoints.factCheckDataArticleLink"
                        />
                      </a>
                    ),
                  }}
                />
              </div>
            </>
          }
          enabled={dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS)}
          readOnly={readOnly}
          title={
            <FormattedMessage
              defaultMessage="Published Claim & Fact-Checks"
              description="Title of section on save feed page where a user can select that fact-checks will be shared in this feed."
              id="feedDataPoints.factChecksTitle"
            />
          }
          onToggle={enabled => toggleDataPoint(enabled, CheckFeedDataPoints.PUBLISHED_FACT_CHECKS)}
        />
        <FeedDataPointsSection
          content={
            <>
              <FormattedHTMLMessage
                defaultMessage="<strong>Media Cluster</strong> data to be shared:"
                description="Title of the content section on save feed page where a user can select that media data will be shared in this feed."
                id="feedDataPoints.mediaContentTitle"
              />
              <ul>
                <FormattedMessage
                  defaultMessage="Type of media (image, video, etc.)"
                  description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  id="feedDataPoints.feedDataPointTypeOfMedia"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Number of requests for each media in the cluster"
                  description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  id="feedDataPoints.feedDataPointNumberOfRequests"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Date last submitted"
                  description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  id="feedDataPoints.feedDataPointDateLastSubmitted"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Language"
                  description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  id="feedDataPoints.feedDataPointMediaLanguage"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Media content when present, such as an image, description, or transcript"
                  description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  id="feedDataPoints.feedDataPointMediaContent"
                  tagName="li"
                />
              </ul>
              <FormattedHTMLMessage
                defaultMessage="<strong>Request</strong> data to be shared:"
                description="Title of the content section on save feed page where a user can select that request data will be shared in this feed."
                id="feedDataPoints.requestContentTitle"
              />
              <ul>
                <FormattedMessage
                  defaultMessage="Anonymized unique user ID (example: 7299e0)"
                  description="Request field listed on save feed page, as part of the list of request fields available when the feed is sharing requests. 7299e0 doesn't need to be localized."
                  id="feedDataPoints.feedDataPointAnonymizedUserId"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Date"
                  description="Request field listed on save feed page, as part of the list of request fields available when the feed is sharing requests."
                  id="feedDataPoints.feedDataPointDate"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Platform (WhatsApp, Telegram, etc.)"
                  description="Request field listed on save feed page, as part of the list of request fields available when the feed is sharing requests."
                  id="feedDataPoints.feedDataPointPlatform"
                  tagName="li"
                />
                <FormattedMessage
                  defaultMessage="Language"
                  description="Request field listed on save feed page, as part of the list of request fields available when the feed is sharing requests."
                  id="feedDataPoints.feedDataPointRequestLanguage"
                  tagName="li"
                />
              </ul>
              <div className="typography-body2">
                <FormattedMessage
                  defaultMessage="Learn more about {mediaDataArticleLink}."
                  description="Footer of section on save feed page where a user can select that media and requests will be shared in this feed."
                  id="feedDataPoints.mediaContentFooter"
                  values={{
                    mediaDataArticleLink: (
                      <a href="https://help.checkmedia.org/en/articles/8542417-shared-feed-creation#h_7414a7ab59" rel="noopener noreferrer" target="_blank"> {/* FIXME: Put the correct link here */}
                        <FormattedMessage
                          defaultMessage="media & requests data"
                          description="Text of the link to an article that explains media and requests data. This link is displayed on the media/requests data points section on the save feed page."
                          id="feedDataPoints.mediaDataArticleLink"
                        />
                      </a>
                    ),
                  }}
                />
              </div>
            </>
          }
          enabled={dataPoints.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS)}
          readOnly={readOnly}
          title={
            <FormattedMessage
              defaultMessage="Media Clusters and Requests"
              description="Title of section on save feed page where a user can select that media clusters and requests will be shared in this feed."
              id="feedDataPoints.feedDataPointsFactChecksMediaClaimsRequestsTitle"
            />
          }
          onToggle={enabled => toggleDataPoint(enabled, CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS)}
        />
      </div>
    </div>
  );
};

FeedDataPoints.defaultProps = {
  dataPoints: [],
  readOnly: false,
  onChange: () => {},
};

FeedDataPoints.propTypes = {
  dataPoints: PropTypes.arrayOf(PropTypes.number.isRequired),
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
};

export default FeedDataPoints;
