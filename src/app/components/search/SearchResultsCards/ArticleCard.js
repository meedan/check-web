import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import TeamAvatar from '../../team/TeamAvatar';
import ItemDate from '../../cds/media-cards/ItemDate';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ItemRating from '../../cds/media-cards/ItemRating';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import ItemReportStatus from '../../cds/media-cards/ItemReportStatus';
import SharedItemCardFooter from './SharedItemCardFooter';
import styles from './ArticleCard.module.css';
import ExplainerForm from '../../article/ExplainerForm';
import ClaimFactCheckForm from '../../article/ClaimFactCheckForm';

const ArticleCard = ({
  title,
  summary,
  url,
  id,
  date,
  createdDate,
  statusLabel,
  statusColor,
  statuses,
  teamAvatar,
  teamName,
  languageCode,
  tags,
  tagOptions,
  publishedAt,
  onChangeTags,
  variant,
  claim_description,
  rating,
}) => {
  const [openEdit, setOpenEdit] = React.useState(false);

  return (
    <div className={`${styles.articleCard} article-card`} >
      <Card>
        <div className={styles.articleCardDescription} onClick={() => setOpenEdit(true)} onKeyDown={() => setOpenEdit(true)}>
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
              tagOptions={tagOptions}
              onChangeTags={onChangeTags}
            />
          </div>
        </div>
        { (statusLabel || date || variant === 'fact-check') ?
          <div className={styles.cardRight}>
            <div className={styles.cardRightTop}>
              { statusLabel && <ItemRating rating={statusLabel} ratingColor={statusColor} /> }
              { variant === 'fact-check' && <ItemReportStatus publishedAt={publishedAt ? new Date(publishedAt * 1000) : null} /> }
            </div>
            { date &&
              <ItemDate
                date={new Date(date * 1000)}
                tooltipLabel={<FormattedMessage id="factCheckCard.dateLabel" defaultMessage="Published at" description="Date tooltip label for fact-check cards" />}
              />
            }
          </div> : null
        }
      </Card>
      {openEdit && variant === 'explainer' && <ExplainerForm
        onClose={setOpenEdit}
        team={{ teamTags: tagOptions }}
        article={{
          title,
          summary,
          language: languageCode,
          tags,
          url,
          date,
          createdDate,
          id,
        }}
      />}
      {openEdit && variant === 'fact-check' && <ClaimFactCheckForm
        onClose={setOpenEdit}
        team={{ teamTags: tagOptions }}
        article={{
          title,
          summary,
          language: languageCode,
          tags,
          url,
          date,
          rating,
          createdDate,
          statuses,
          id,
          claim_description,
          publishedAt,
        }}
      />}
    </div>
  );
};


ArticleCard.defaultProps = {
  summary: null,
  url: null,
  statusColor: 'black',
  teamAvatar: null,
  teamName: null,
  languageCode: null,
  tags: [],
  tagOptions: null,
  variant: 'explainer',
  statusLabel: null,
  publishedAt: null,
};

ArticleCard.propTypes = {
  title: PropTypes.string.isRequired,
  summary: PropTypes.string,
  url: PropTypes.string,
  date: PropTypes.number.isRequired, // Timestamp
  createdDate: PropTypes.number.isRequired,
  statusLabel: PropTypes.string,
  statusColor: PropTypes.string,
  teamAvatar: PropTypes.string, // URL
  teamName: PropTypes.string,
  languageCode: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  tagOptions: PropTypes.arrayOf(PropTypes.string),
  publishedAt: PropTypes.number, // Timestamp
  onChangeTags: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['explainer', 'fact-check']),
};

export default ArticleCard;
