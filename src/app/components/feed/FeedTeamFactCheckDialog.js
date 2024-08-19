/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import Dialog from '@material-ui/core/Dialog';
import BulletSeparator from '../layout/BulletSeparator';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ArticleUrl from '../cds/media-cards/ArticleUrl';
import IconClose from '../../icons/clear.svg';
import CalendarIcon from '../../icons/calendar_month.svg';
import LanguageIcon from '../../icons/language.svg';
import dialogStyles from '../../styles/css/dialog.module.css';
import { languageLabel } from '../../LanguageRegistry';
import styles from './FeedItem.module.css';

const FeedTeamFactCheckDialog = ({ claimDescription, onClose, rating }) => (
  // Avoid closing the dialog when clicking on it
  <div onClick={(e) => { e.stopPropagation(); }} onKeyDown={(e) => { e.stopPropagation(); }}>
    <Dialog
      className={dialogStyles['dialog-window']}
      open
    >
      <div className={dialogStyles['dialog-title']}>
        <FormattedMessage
          defaultMessage="Claim & Fact-check"
          description="Title for claim & fact-check dialog on the feed item page."
          id="feedTeamFactCheckDialog.title"
          tagName="h6"
        />
        <ButtonMain
          className={dialogStyles['dialog-close-button']}
          iconCenter={<IconClose />}
          size="small"
          theme="text"
          variant="text"
          onClick={onClose}
        />
      </div>
      <div className={cx(dialogStyles['dialog-content'], styles.feedItemDialog)}>
        <div className={styles.feedItemDialogBox}>
          <div className={cx('typography-subtitle2', styles.feedItemDialogSubtitle)}>
            <FormattedMessage
              defaultMessage="Claim"
              description="Title for the claim section on the claim & fact-check dialog on the feed item page."
              id="feedTeamFactCheckDialog.claim"
            />
          </div>
          { claimDescription?.description ?
            <div className="typography-body2-bold">
              {claimDescription.description}
            </div> :
            null
          }
          { claimDescription?.context ?
            <div className="typography-body2">
              {claimDescription.context}
            </div> :
            null
          }
        </div>
        <div className={styles.feedItemDialogBox}>
          <div className={cx('typography-subtitle2', styles.feedItemDialogSubtitle, styles.feedItemDialogSubtitleFactCheck)}>
            { !claimDescription?.fact_check ?
              <h5 className={styles.feedContentNotAvailable}>
                <FormattedMessage
                  defaultMessage="No Fact-Check Available"
                  description="Title for the fact-check section on the claim & fact-check dialog on the feed item page when there is no fact-check available."
                  id="feedTeamFactCheckDialog.noFactCheck"
                />
              </h5> :
              null
            }
            { claimDescription?.fact_check ?
              <>
                <div className={styles.feedItemDialogSubtitleWrapper}>
                  <FormattedMessage
                    defaultMessage="Fact-Check"
                    description="Title for the fact-check section on the claim & fact-check dialog on the feed item page."
                    id="feedTeamFactCheckDialog.factCheck"
                  />
                  <div className={styles.feedItemDialogSubtitleFactCheckRating}>
                    {rating}
                  </div>
                </div>
                <BulletSeparator
                  className={styles.feedItemDialogBulletSeparator}
                  compact
                  details={[
                    claimDescription.fact_check.language !== 'und' && (
                      <div className={styles.feedItemDialogBulletSeparatorComponent}>
                        <LanguageIcon />
                        <span>{languageLabel(claimDescription.fact_check.language)}</span>
                      </div>
                    ),
                    (
                      <div className={styles.feedItemDialogBulletSeparatorComponent}>
                        <CalendarIcon />
                        <FormattedDate day="numeric" month="long" value={new Date(parseInt(claimDescription.fact_check.updated_at, 10) * 1000)} year="numeric" />
                      </div>
                    ),
                  ]}
                />
              </> :
              null
            }
          </div>
          <ArticleUrl url={claimDescription?.fact_check?.url} variant="fact-check" />
          { claimDescription?.fact_check?.title ?
            <div className="typography-body2-bold">
              {claimDescription.fact_check.title}
            </div> :
            null
          }
          { claimDescription?.fact_check?.summary ?
            <div className="typography-body2">
              {claimDescription.fact_check.summary}
            </div> :
            null
          }
        </div>
      </div>
      <div className={dialogStyles['dialog-actions']}>
        <ButtonMain
          className="feed-team-fact-check-dialog__close-button"
          label={
            <FormattedMessage
              defaultMessage="Close"
              description="Label of a button to close the claim & fact-check dialog window on the feed item page."
              id="feedTeamFactCheckDialog.close"
            />
          }
          size="default"
          onClick={onClose}
        />
      </div>
    </Dialog>
  </div>
);

FeedTeamFactCheckDialog.defaultProps = {
  claimDescription: {},
};

FeedTeamFactCheckDialog.propTypes = {
  rating: PropTypes.string.isRequired,
  claimDescription: PropTypes.shape({
    description: PropTypes.string,
    context: PropTypes.string,
    fact_check: PropTypes.shape({
      title: PropTypes.string,
      summary: PropTypes.string,
      language: PropTypes.string,
      updated_at: PropTypes.string,
      url: PropTypes.string,
    }),
  }),
  onClose: PropTypes.func.isRequired,
};

export default createFragmentContainer(FeedTeamFactCheckDialog, graphql`
  fragment FeedTeamFactCheckDialog_claimDescription on ClaimDescription {
    description
    context
    fact_check(report_status: "published") {
      title
      summary
      language
      updated_at
      url
    }
  }
`);
