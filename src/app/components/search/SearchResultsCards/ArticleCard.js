/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import SharedItemCardFooter from './SharedItemCardFooter';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import TeamAvatar from '../../team/TeamAvatar';
import ItemDate from '../../cds/media-cards/ItemDate';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ItemRating from '../../cds/media-cards/ItemRating';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import ItemReportStatus from '../../cds/media-cards/ItemReportStatus';
import styles from './ArticleCard.module.css';

const ArticleCard = ({
  date,
  handleClick,
  isPublished,
  languageCode,
  onChangeTags,
  projectMediaDbid,
  publishedAt,
  statusColor,
  statusLabel,
  summary,
  tagOptions,
  tags,
  teamAvatar,
  teamName,
  teamSlug,
  title,
  url,
  variant,
}) => (
  <div
    className={cx('article-card', styles.articleCard)}
    onClick={handleClick}
    onKeyDown={handleClick}
  >
    <Card>
      <div className={styles.articleCardDescription}>
        <CardHoverContext.Consumer>
          { isHovered => (
            <ItemDescription
              description={summary}
              showCollapseButton={isHovered}
              title={title}
              url={url}
              variant={variant}
            />
          )}
        </CardHoverContext.Consumer>
        { teamAvatar && teamName ? (
          <div>
            <Tooltip arrow title={teamName}>
              <span>
                <TeamAvatar size="30px" team={{ avatar: teamAvatar }} />
              </span>
            </Tooltip>
          </div>
        ) : null }
        <SharedItemCardFooter
          languageCode={languageCode}
          tagOptions={tagOptions}
          tags={tags}
          teamSlug={teamSlug}
          onChangeTags={onChangeTags}
        />
      </div>
      { statusLabel || date ?
        <div className={styles.cardRight}>
          { variant === 'fact-check' && (
            <div className={styles.cardRightTop}>
              { statusLabel && <ItemRating className={styles.cardRightTopRating} rating={statusLabel} ratingColor={statusColor} size="small" /> }
              <ItemReportStatus
                className={styles.cardRightTopPublished}
                isPublished={isPublished}
                projectMediaDbid={projectMediaDbid}
                publishedAt={publishedAt ? new Date(publishedAt * 1000) : null}
              />
            </div>
          )}
          { date &&
            <ItemDate
              date={new Date(date * 1000)}
              tooltipLabel={<FormattedMessage defaultMessage="Last Updated" description="This appears as a label before a date with a colon between them, like 'Last Updated: May 5, 2023'." id="sharedItemCard.lastUpdated" />}
            />
          }
        </div> : null
      }
    </Card>
  </div>
);

ArticleCard.defaultProps = {
  summary: null,
  url: null,
  statusColor: 'black',
  teamAvatar: null,
  teamName: null,
  languageCode: null,
  tags: [],
  tagOptions: null,
  onChangeTags: null,
  variant: 'explainer',
  statusLabel: null,
  projectMediaDbid: null,
  publishedAt: null,
};

ArticleCard.propTypes = {
  title: PropTypes.string.isRequired,
  summary: PropTypes.string,
  url: PropTypes.string,
  date: PropTypes.oneOfType([
    PropTypes.string, // article.updated_at (Articles.js)
    PropTypes.number, // projectMedia.feed_columns_values.updated_at_timestamp (SearchResultsCards/index.js)
  ]).isRequired, // Timestamp
  statusLabel: PropTypes.string,
  statusColor: PropTypes.string,
  teamAvatar: PropTypes.string, // URL
  teamName: PropTypes.string,
  languageCode: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  tagOptions: PropTypes.arrayOf(PropTypes.string),
  projectMediaDbid: PropTypes.number,
  publishedAt: PropTypes.number, // Timestamp
  onChangeTags: PropTypes.func,
  variant: PropTypes.oneOf(['explainer', 'fact-check']),
  handleClick: PropTypes.func.isRequired,
};

export default ArticleCard;
