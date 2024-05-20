import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import TeamAvatar from '../../team/TeamAvatar';
import ItemDate from '../../cds/media-cards/ItemDate';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ItemRating from '../../cds/media-cards/ItemRating';
import ItemDescription from '../../cds/media-cards/ItemDescription';
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
  onChangeTags,
  variant,
}) => (
  <div className={`${styles.articleCard} article-card`}>
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
        <div>
          <SharedItemCardFooter
            languageCode={languageCode}
            tags={tags}
            onChangeTags={onChangeTags}
          />
        </div>
      </div>
      { (statusLabel || date) ?
        <div className={styles.cardRight}>
          { statusLabel ? <ItemRating rating={statusLabel} ratingColor={statusColor} /> : null }
          { date ?
            <ItemDate
              date={new Date(date * 1000)}
              tooltipLabel={<FormattedMessage id="factCheckCard.dateLabel" defaultMessage="Published at" description="Date tooltip label for fact-check cards" />}
            /> : null
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
  variant: 'explainer',
};

ArticleCard.propTypes = {
  title: PropTypes.string.isRequired,
  statusLabel: PropTypes.string.isRequired,
  statusColor: PropTypes.string,
  date: PropTypes.number.isRequired, // Timestamp
  summary: PropTypes.string,
  url: PropTypes.string,
  teamAvatar: PropTypes.string, // URL
  teamName: PropTypes.string,
  variant: PropTypes.oneOf(['explainer', 'fact-check']),
};

export default ArticleCard;
