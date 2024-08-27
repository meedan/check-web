/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import RemoveArticleButton from './RemoveArticleButton';
import Alert from '../cds/alerts-and-prompts/Alert';
import Card from '../cds/media-cards/Card';
import EllipseIcon from '../../icons/ellipse.svg';
import FactCheckIcon from '../../icons/fact_check.svg';
import BookIcon from '../../icons/book.svg';
import BulletSeparator from '../layout/BulletSeparator';
import Language from '../cds/media-cards/Language';
import LastRequestDate from '../cds/media-cards/LastRequestDate';
import ArticleUrl from '../cds/media-cards/ArticleUrl';
import ItemReportStatus from '../cds/media-cards/ItemReportStatus';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import cardStyles from '../cds/media-cards/Card.module.css';
import styles from './ArticleCard.module.css';

const MediaArticleCard = ({
  date,
  id,
  languageCode,
  onClick,
  onRemove,
  publishedAt,
  removeDisabled,
  statusColor,
  statusLabel,
  title,
  url,
  variant,
}) => (
  <div className={cx('article-card', styles.articleCard, styles.mediaArticleCardWrapper)}>
    <Card className={styles.mediaArticleCard}>
      { variant === 'fact-check' && !publishedAt ?
        <Alert
          className={styles.mediaArticleCardAlert}
          contained
          content={
            <FormattedMessage
              defaultMessage="This Fact-Check will not be returned to Tipline users until it is published"
              description="Description of the alert message displayed on articles list when an unpublished claim & fact-check is added"
              id="mediaArticleCard.unpublishedAlertContent"
            />
          }
          variant="warning"
        />
        : null
      }
      <div className={styles.mediaArticleCardContent}>
        <div className={styles.mediaArticleCardDescription}>
          <div className={cx('typography-body2-bold', styles.articleCardHeader)}>
            <div className={styles.articleType}>
              <div className={styles.articleIcon}>
                { variant === 'fact-check' && <FactCheckIcon /> }
                { variant === 'explainer' && <BookIcon /> }
              </div>
              { variant === 'fact-check' && <FormattedMessage defaultMessage="Fact-Check" description="Title in an article card on item page." id="mediaArticleCard.factCheck" /> }
              { variant === 'explainer' && <FormattedMessage defaultMessage="Explainer" description="Title in an article card on item page." id="mediaArticleCard.explainer" /> }
              { statusLabel && ': ' }
            </div>
            { statusLabel && <div><EllipseIcon style={{ color: statusColor }} /> {statusLabel}</div> }
          </div>
          <div
            className={cx(
              cardStyles.cardSummary,
              cardStyles.cardSummaryCollapsed,
            )}
          >
            <div className={cardStyles.cardSummaryContent}>
              { url ?
                <ArticleUrl linkText={title} showIcon={false} title={title} url={url} variant={variant} />
                :
                <span className={cx(cardStyles.cardDescription)}>
                  {title}
                </span>
              }
            </div>
          </div>
        </div>
        <div className={styles.articleCardRight}>
          <RemoveArticleButton disabled={removeDisabled} id={id} variant={variant} onRemove={onRemove} />
        </div>
      </div>
      <BulletSeparator
        className={styles.mediaArticleCardFooter}
        details={[
          variant === 'fact-check' && (<ItemReportStatus
            isPublished={Boolean(publishedAt)}
            publishedAt={publishedAt ? new Date(publishedAt * 1000) : null}
            theme="lightText"
            tooltip={false}
            variant="text"
          />),
          languageCode && (
            <Language
              languageCode={languageCode}
              theme="lightText"
              variant="text"
            />
          ),
          date && (
            <LastRequestDate
              lastRequestDate={date}
              theme="lightText"
              tooltipLabel={(
                <FormattedMessage
                  defaultMessage="Last Updated"
                  description="This appears as a label before a date with a colon between them, like 'Last Requested: May 5, 2023'."
                  id="sharedItemCard.lastRequested"
                />
              )}
              variant="text"
            />
          ),
          (
            <ButtonMain
              buttonProps={{
                id: 'media-article-card__edit-button',
              }}
              label={<FormattedMessage defaultMessage="Edit Article" description="Label for edit button" id="mediaArticleCard.editButton" />}
              size="small"
              theme="text"
              variant="contained"
              onClick={onClick}
            />
          ),
        ]}
      />
    </Card>
  </div>
);

MediaArticleCard.defaultProps = {
  url: null,
  languageCode: null,
  variant: 'explainer',
  statusLabel: null,
  statusColor: null,
  publishedAt: null,
  onClick: () => {},
  onRemove: () => {},
  removeDisabled: false,
};

MediaArticleCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  url: PropTypes.string,
  date: PropTypes.instanceOf(Date).isRequired,
  statusLabel: PropTypes.string,
  statusColor: PropTypes.string,
  languageCode: PropTypes.string,
  publishedAt: PropTypes.number, // Timestamp
  variant: PropTypes.oneOf(['explainer', 'fact-check']),
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  removeDisabled: PropTypes.bool,
};

export default MediaArticleCard;
