import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import Dialog from '@material-ui/core/Dialog';
import BulletSeparator from '../layout/BulletSeparator';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import FactCheckUrl from '../cds/media-cards/FactCheckUrl';
import IconClose from '../../icons/clear.svg';
import CalendarIcon from '../../icons/calendar_month.svg';
import LanguageIcon from '../../icons/language.svg';
import dialogStyles from '../../styles/css/dialog.module.css';
import { languageLabel } from '../../LanguageRegistry';
import styles from './FeedItem.module.css';

const FeedTeamFactCheckDialog = ({ claimDescription, rating, onClose }) => (
  // Avoid closing the dialog when clicking on it
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  <div onClick={(e) => { e.stopPropagation(); }}>
    <Dialog
      className={dialogStyles['dialog-window']}
      open
    >
      <div className={dialogStyles['dialog-title']}>
        <FormattedMessage
          tagName="h6"
          id="feedTeamFactCheckDialog.title"
          defaultMessage="Claim and Fact-check"
          description="Title for claim and fact-check dialog on the feed item page."
        />
        <ButtonMain
          className={dialogStyles['dialog-close-button']}
          variant="text"
          size="small"
          theme="text"
          iconCenter={<IconClose />}
          onClick={onClose}
        />
      </div>
      <div className={cx(dialogStyles['dialog-content'], styles.feedItemDialog)}>
        <div className={styles.feedItemDialogBox}>
          <div className={cx('typography-subtitle2', styles.feedItemDialogSubtitle)}>
            <FormattedMessage
              id="feedTeamFactCheckDialog.claim"
              defaultMessage="Claim"
              description="Title for the claim section on the claim and fact-check dialog on the feed item page."
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
            <FormattedMessage
              id="feedTeamFactCheckDialog.factCheck"
              defaultMessage="Fact-Check"
              description="Title for the fact-check section on the claim and fact-check dialog on the feed item page."
            />
            { claimDescription?.fact_check ?
              <BulletSeparator
                className={styles.feedItemDialogBulletSeparator}
                compact
                details={[
                  (
                    <div className={styles.feedItemDialogBulletSeparatorComponent}>
                      {rating}
                    </div>
                  ),
                  claimDescription.fact_check.language !== 'und' && (
                    <div className={styles.feedItemDialogBulletSeparatorComponent}>
                      <LanguageIcon />
                      <span>{languageLabel(claimDescription.fact_check.language)}</span>
                    </div>
                  ),
                  (
                    <div className={styles.feedItemDialogBulletSeparatorComponent}>
                      <CalendarIcon />
                      <FormattedDate value={new Date(parseInt(claimDescription.fact_check.updated_at, 10) * 1000)} year="numeric" month="long" day="numeric" />
                    </div>
                  ),
                ]}
              /> :
              null
            }
          </div>
          { claimDescription?.fact_check?.url ?
            <FactCheckUrl factCheckUrl={claimDescription.fact_check.url} /> :
            null
          }
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
          size="default"
          onClick={onClose}
          label={
            <FormattedMessage
              id="feedTeamFactCheckDialog.close"
              defaultMessage="Close"
              description="Label of a button to close the claim and fact-check dialog window on the feed item page."
            />
          }
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
    fact_check {
      title
      summary
      language
      updated_at
      url
    }
  }
`);
