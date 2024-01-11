import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';
import FeedDataPointsSection from './FeedDataPointsSection';
import Alert from '../cds/alerts-and-prompts/Alert';
import { stringHelper } from '../../customHelpers';
import styles from './SaveFeed.module.css';

const FeedDataPoints = ({ readOnly, dataPoints, onChange }) => {
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
            id="feedDataPoints.title"
            defaultMessage="What workspace data will be shared in this feed?"
            description="Title of section where the data points being shared in a feed can be selected."
          />
        </div>
        { readOnly ?
          <Alert
            variant="warning"
            title={
              <FormattedMessage
                id="feedDataPoints.readOnlyAlertTitle"
                defaultMessage="This shared feed already contains data from other collaborators."
                description="Title of the alert message displayed on data points section of the edit feed page."
              />
            }
            content={
              <FormattedMessage
                id="feedDataPoints.readOnlyAlertContent"
                defaultMessage="Contact {checkSupportLink} to make adjustments to the workspace data of this shared feed."
                description="Description of the alert message displayed on data points section of the edit feed page."
                values={{
                  checkSupportLink: (
                    <a href={`mailto:${stringHelper('SUPPORT_EMAIL')}`}>
                      <FormattedMessage
                        id="feedDataPoints.contactSupportLinkText"
                        defaultMessage="Check Support"
                        description="Text of the contact support link displayed on the alert box of the data points section in the edit feed page."
                      />
                    </a>
                  ),
                }}
              />
            }
          />
          : null
        }
        <FeedDataPointsSection
          readOnly={readOnly}
          enabled={dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS)}
          onToggle={enabled => toggleDataPoint(enabled, CheckFeedDataPoints.PUBLISHED_FACT_CHECKS)}
          title={
            <FormattedMessage
              id="feedDataPoints.factChecksTitle"
              defaultMessage="Published Fact-Checks"
              description="Title of section on save feed page where a user can select that fact-checks will be shared in this feed."
            />
          }
          content={
            <>
              <FormattedHTMLMessage
                id="feedDataPoints.factChecksContentTitle"
                defaultMessage="<strong>Published Fact-Check</strong> data to be shared:"
                description="Title of the content section on save feed page where a user can select that fact-checks will be shared in this feed."
              />
              <ul>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointTitle"
                    defaultMessage="Title"
                    description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointDescription"
                    defaultMessage="Description"
                    description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointDataPublished"
                    defaultMessage="Date published"
                    description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointLanguage"
                    defaultMessage="Language"
                    description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointRating"
                    defaultMessage="Rating"
                    description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointArticleUrl"
                    defaultMessage="Article URL"
                    description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                  />
                </li>
              </ul>
              <div className="typography-body2">
                <FormattedMessage
                  id="feedDataPoints.factChecksContentFooter"
                  defaultMessage="Learn more about {factCheckDataArticleLink}."
                  values={{
                    factCheckDataArticleLink: (
                      <a href="https://help.checkmedia.org/" rel="noopener noreferrer" target="_blank"> {/* FIXME: Put the correct link here */}
                        <FormattedMessage
                          id="feedDataPoints.factCheckDataArticleLink"
                          defaultMessage="fact-check data"
                          description="Text of the link to an article that explains fact-check data. This link is displayed on the fact-check data points section on the save feed page."
                        />
                      </a>
                    ),
                  }}
                  description="Footer of section on save feed page where a user can select that fact-checks will be shared in this feed."
                />
              </div>
            </>
          }
        />
        <FeedDataPointsSection
          readOnly={readOnly}
          enabled={dataPoints.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS)}
          onToggle={enabled => toggleDataPoint(enabled, CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS)}
          title={
            <FormattedMessage
              id="feedDataPoints.feedDataPointsFactChecksMediaClaimsRequestsTitle"
              defaultMessage="Media, Claim & Requests"
              description="Title of section on save feed page where a user can select that media, claim and requests will be shared in this feed."
            />
          }
          content={
            <>
              <FormattedHTMLMessage
                id="feedDataPoints.mediaContentTitle"
                defaultMessage="<strong>Media</strong> data to be shared:"
                description="Title of the content section on save feed page where a user can select that media data will be shared in this feed."
              />
              <ul>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointClaim"
                    defaultMessage="Claim"
                    description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointTypeOfMedia"
                    defaultMessage="Type of media (image, video, etc.)"
                    description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointNumberOfRequests"
                    defaultMessage="Number of requests for each media"
                    description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointDateLastSubmitted"
                    defaultMessage="Date last submitted"
                    description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointMediaLanguage"
                    defaultMessage="Language"
                    description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointMediaContent"
                    defaultMessage="Media content when present, such as image, description or transcript"
                    description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                  />
                </li>
              </ul>
              <FormattedHTMLMessage
                id="feedDataPoints.requestContentTitle"
                defaultMessage="<strong>Request</strong> data to be shared:"
                description="Title of the content section on save feed page where a user can select that request data will be shared in this feed."
              />
              <ul>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointAnonymizedUserId"
                    defaultMessage="Anonymized unique user ID (example: 7299e0)"
                    description="Request field listed on save feed page, as part of the list of request fields available when the feed is sharing requests. 7299e0 doesn't need to be localized."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointDate"
                    defaultMessage="Date"
                    description="Request field listed on save feed page, as part of the list of request fields available when the feed is sharing requests."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointPlatform"
                    defaultMessage="Platform (WhatsApp, Telegram, etc.)"
                    description="Request field listed on save feed page, as part of the list of request fields available when the feed is sharing requests."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="feedDataPoints.feedDataPointRequestLanguage"
                    defaultMessage="Language"
                    description="Request field listed on save feed page, as part of the list of request fields available when the feed is sharing requests."
                  />
                </li>
              </ul>
              <div className="typography-body2">
                <FormattedMessage
                  id="feedDataPoints.mediaContentFooter"
                  defaultMessage="Learn more about {mediaDataArticleLink}."
                  values={{
                    mediaDataArticleLink: (
                      <a href="https://help.checkmedia.org/" rel="noopener noreferrer" target="_blank"> {/* FIXME: Put the correct link here */}
                        <FormattedMessage
                          id="feedDataPoints.mediaDataArticleLink"
                          defaultMessage="media & requests data"
                          description="Text of the link to an article that explains media and requests data. This link is displayed on the media/requests data points section on the save feed page."
                        />
                      </a>
                    ),
                  }}
                  description="Footer of section on save feed page where a user can select that media and requests will be shared in this feed."
                />
              </div>
            </>
          }
        />
      </div>
    </div>
  );
};

FeedDataPoints.defaultProps = {
  readOnly: false,
  dataPoints: [],
  onChange: () => {},
};

FeedDataPoints.propTypes = {
  readOnly: PropTypes.bool,
  dataPoints: PropTypes.arrayOf(PropTypes.number.isRequired),
  onChange: PropTypes.func,
};

export default FeedDataPoints;
