import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import TeamAvatar from '../../team/TeamAvatar';
import ItemDate from '../../cds/media-cards/ItemDate';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ItemRating from '../../cds/media-cards/ItemRating';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import ItemReportStatus from '../../cds/media-cards/ItemReportStatus';
import SharedItemCardFooter from './SharedItemCardFooter';
import styles from './ArticleCard.module.css';

const ArticleCard = ({
  title,
  summary,
  url,
  date,
  statusLabel,
  statusColor,
  teamAvatar,
  teamName,
  languageCode,
  tags,
  publishedAt,
  onChangeTags,
  variant,
}) => (
  <div className={cx('article-card', styles.articleCard)}>
    <Card>
      <div className={styles.articleCardDescription}>
        <CardHoverContext.Consumer>
          { isHovered => (
            <ItemDescription
              title={title}
              description={summary}
              url={url}
              showCollapseButton={isHovered}
              variant={variant}
            />
          )}
        </CardHoverContext.Consumer>
        { teamAvatar && teamName ? (
          <div>
            <Tooltip arrow title={teamName}>
              <span>
                <TeamAvatar team={{ avatar: teamAvatar }} size="30px" />
              </span>
            </Tooltip>
          </div>
        ) : null }
        <SharedItemCardFooter
          languageCode={languageCode}
          tags={tags}
          onChangeTags={onChangeTags}
        />
      </div>
      { statusLabel || date ?
        <div className={styles.cardRight}>
          { variant === 'fact-check' && (
            <div className={styles.cardRightTop}>
              { statusLabel && <ItemRating className={styles.cardRightTopRating} rating={statusLabel} ratingColor={statusColor} size="small" /> }
              { publishedAt && <ItemReportStatus className={styles.cardRightTopPublished} publishedAt={publishedAt ? new Date(publishedAt * 1000) : null} /> }
            </div>
          )}
          { date &&
            <ItemDate
              date={new Date(date * 1000)}
              tooltipLabel={<FormattedMessage id="factCheckCard.dateLabel" defaultMessage="Published at" description="Date tooltip label for fact-check cards" />}
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
  variant: 'explainer',
  statusLabel: null,
  publishedAt: null,
};

ArticleCard.propTypes = {
  title: PropTypes.string.isRequired,
  summary: PropTypes.string,
  url: PropTypes.string,
  date: PropTypes.number.isRequired, // Timestamp
  statusLabel: PropTypes.string,
  statusColor: PropTypes.string,
  teamAvatar: PropTypes.string, // URL
  teamName: PropTypes.string,
  languageCode: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  publishedAt: PropTypes.number, // Timestamp
  onChangeTags: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['explainer', 'fact-check']),
};

export default ArticleCard;
