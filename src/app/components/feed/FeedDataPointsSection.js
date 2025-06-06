import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import FeedContent from './FeedContent';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ChevronDownIcon from '../../icons/chevron_down.svg';
import ChevronRightIcon from '../../icons/chevron_right.svg';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import styles from './SaveFeed.module.css';

const FeedDataPointsSection = ({
  enabled,
  listId,
  listType,
  onChange,
  onRemove,
  onToggle,
  readOnly,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const title = listType === 'article' ? (
    <FormattedMessage
      defaultMessage="Articles"
      description="Title of section on save feed page where a user can select that fact-checks will be shared in this feed."
      id="feedDataPoints.factChecksTitle"
    />
  ) : (
    <FormattedMessage
      defaultMessage="Media Clusters and Requests"
      description="Title of section on save feed page where a user can select that media clusters and requests will be shared in this feed."
      id="feedDataPoints.feedDataPointsFactChecksMediaClaimsRequestsTitle"
    />
  );

  return (
    <div className={styles.dataPointsSection}>
      <div className={styles.dataPointsSectionHeader}>
        <ButtonMain
          iconCenter={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          size="small"
          theme="lightText"
          variant="contained"
          onClick={() => { setExpanded(!expanded); }}
        />
        <SwitchComponent
          checked={enabled}
          className="typography-body2"
          disabled={readOnly}
          label={title}
          onChange={onToggle}
        />
      </div>
      <div>
        { enabled ?
          <FeedContent
            listId={listId}
            listType={listType}
            onChange={onChange}
            onRemove={onRemove}
          />
          : null }
      </div>
      <div className={cx(styles.dataPointsSectionBody, expanded ? styles.dataPointsSectionExpanded : styles.dataPointsSectionCollapsed)}>
        { listType === 'article' ?
          <div className={cx(styles.dataPointsSectionBodyContent, 'typography-body2')}>
            <FormattedHTMLMessage
              defaultMessage="<strong>Article</strong> data to be shared:"
              description="Title of the content section on save feed page where a user can select that fact-checks will be shared in this feed."
              id="feedDataPoints.ArticleContentTitle"
            />
            <ul>
              <FormattedMessage
                defaultMessage="Title"
                description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                id="feedDataPoints.feedDataPointArticleTitle"
                tagName="li"
              />
              <FormattedMessage
                defaultMessage="Summary"
                description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                id="feedDataPoints.feedDataPointArticleSummary"
                tagName="li"
              />
              <FormattedMessage
                defaultMessage="URL"
                description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                id="feedDataPoints.feedDataPointArticleUrl"
                tagName="li"
              />
              <FormattedMessage
                defaultMessage="Language"
                description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                id="feedDataPoints.feedDataPointArticleLanguage"
                tagName="li"
              />
              <FormattedMessage
                defaultMessage="Claim*"
                description="Media field listed on save feed page, as part of the list of media fields available when the feed is sharing media."
                id="feedDataPoints.feedDataPointClaim"
                tagName="li"
              />
              <FormattedMessage
                defaultMessage="Rating*"
                description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                id="feedDataPoints.feedDataPointRating"
                tagName="li"
              />
              <FormattedMessage
                defaultMessage="Date published*"
                description="Fact-check field listed on save feed page, as part of the list of fact-check fields available when the feed is sharing fact-checks."
                id="feedDataPoints.feedDataPointDataPublished"
                tagName="li"
              />
            </ul>
            <div className="typography-body2">
              <FormattedMessage
                defaultMessage="*If article shared is a claim & fact-check"
                description="Footer of section on save feed page where a user can select that claim & fact-checks will be shared in this feed."
                id="feedDataPoints.factChecksContentFooter"
              />
            </div>
          </div>
          : null }
        { listType === 'media' ?
          <div className={cx(styles.dataPointsSectionBodyContent, 'typography-body2')}>
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
          </div>
          : null }
      </div>
    </div>
  );
};

FeedDataPointsSection.defaultProps = {
  enabled: false,
  listId: null,
  readOnly: false,
  onToggle: () => {},
};

FeedDataPointsSection.propTypes = {
  enabled: PropTypes.bool,
  listId: PropTypes.number,
  listType: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onToggle: PropTypes.func,
};

export default FeedDataPointsSection;
