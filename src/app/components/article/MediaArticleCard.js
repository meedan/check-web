import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import Card from '../cds/media-cards/Card';
import EllipseIcon from '../../icons/ellipse.svg';
import FactCheckIcon from '../../icons/fact_check.svg';
import BookIcon from '../../icons/book.svg';
import BulletSeparator from '../layout/BulletSeparator';
import styles from './ArticleCard.module.css';
import Language from '../cds/media-cards/Language';
import LastRequestDate from '../cds/media-cards/LastRequestDate';
import ArticleUrl from '../cds/media-cards/ArticleUrl';
import ItemReportStatus from '../cds/media-cards/ItemReportStatus';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import RemoveArticleButton from './RemoveArticleButton';

const MediaArticleCard = ({
  title,
  url,
  date,
  statusLabel,
  statusColor,
  languageCode,
  publishedAt,
  variant,
  onClick,
  id,
}) => (
  <div className={cx('article-card', styles.articleCard)}>
    <Card>
      <div>
        <div className={cx('typography-body2-bold', styles.articleCardHeader)}>
          <div className={styles.articleType}>
            <div className={styles.articleIcon}>
              { variant === 'fact-check' && <FactCheckIcon /> }
              { variant === 'explainer' && <BookIcon /> }
            </div>
            { variant === 'fact-check' && <FormattedMessage id="mediaArticleCard.factCheck" defaultMessage="Fact-Check" description="Title in an article card on item page." /> }
            { variant === 'explainer' && <FormattedMessage id="mediaArticleCard.explainer" defaultMessage="Explainer" description="Title in an article card on item page." /> }
            { statusLabel && ': ' }
          </div>
          { statusLabel && <div><EllipseIcon style={{ color: statusColor }} /> {statusLabel}</div> }
        </div>
        <span>
          { url ?
            <ArticleUrl url={url} title={title} variant={variant} showIcon={false} linkText={title} /> :
            <div className="typography-body2">
              {title}
            </div>
          }
        </span>
        <BulletSeparator
          details={[
            variant === 'fact-check' && (<ItemReportStatus
              publishedAt={publishedAt ? new Date(publishedAt * 1000) : null}
              isPublished={Boolean(publishedAt)}
              variant="text"
              theme="lightText"
              tooltip={false}
            />),
            languageCode && (
              <Language
                languageCode={languageCode}
                variant="text"
                theme="lightText"
              />
            ),
            date && (
              <LastRequestDate
                tooltip={false}
                variant="text"
                theme="lightText"
                lastRequestDate={new Date(date * 1000)}
              />
            ),
            (
              <ButtonMain
                buttonProps={{
                  type: null,
                }}
                label={<FormattedMessage id="mediaArticleCard.editButton" defaultMessage="Edit Article" description="Label for edit button" />}
                variant="contained"
                size="small"
                theme="text"
                onClick={onClick}
              />
            ),
          ]}
        />
      </div>
      <div className={styles.articleCardRight}>
        <RemoveArticleButton id={id} variant={variant} />
      </div>
    </Card>
  </div>
);

MediaArticleCard.defaultProps = {
  url: null,
  languageCode: null,
  variant: 'explainer',
  statusLabel: null,
  publishedAt: null,
  onClick: () => {},
};

MediaArticleCard.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string,
  date: PropTypes.number.isRequired, // Timestamp
  statusLabel: PropTypes.string,
  statusColor: PropTypes.string.isRequired,
  languageCode: PropTypes.string,
  publishedAt: PropTypes.number, // Timestamp
  variant: PropTypes.oneOf(['explainer', 'fact-check']),
  onClick: PropTypes.func,
  id: PropTypes.number.isRequired,
};

export default MediaArticleCard;
