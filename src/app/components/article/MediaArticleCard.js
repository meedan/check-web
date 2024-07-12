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

const MediaArticleCard = ({
  title,
  url,
  date,
  statusLabel,
  statusColor,
  languageCode,
  publishedAt,
  variant,
}) => (
  <div className={cx('article-card', styles.articleCard)}>
    <Card>
      <div>
        <div className={cx('typography-body2')}>
          <span className={styles.articleIcon}>
            {variant === 'fact-check' ?
              <FactCheckIcon /> : <BookIcon />
            }
          </span>
          {variant === 'fact-check' ? 'Fact-Check' : 'Explainer'}
          {statusLabel && (
            <>
              :<EllipseIcon style={{ color: statusColor }} /> {statusLabel}
            </>
          )}
        </div>
        <span>
          {url ? (
            <ArticleUrl url={url} title={title} variant={variant} showIcon={false} />
          ) : (
            title
          )}
        </span>
        <div />
        <BulletSeparator
          details={[
            variant === 'fact-check ' && (<ItemReportStatus
              publishedAt={publishedAt ? new Date(publishedAt * 1000) : null}
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
                disabled
                buttonProps={{
                  type: null,
                }}
                label={<FormattedMessage id="mediaArticleCard.editButton" defaultMessage="Edit Article" description="Label for edit button" />}
                variant="contained"
                size="small"
                theme="text"
                onClick={() => {}}
              />
            ),
          ]}
        />
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
};

export default MediaArticleCard;
