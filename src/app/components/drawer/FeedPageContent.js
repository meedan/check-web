import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import AddIcon from '../../icons/add.svg';
import FeedIcon from '../../icons/dynamic_feed.svg';
import styles from './FeedPage.module.css';
import Can from '../Can';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';

// eslint-disable-next-line
console.log('FeedPage.js')
const FeedSection = ({
  titleId, titleDefault, titleDescription, contentId, contentDefault, contentDescription,
}) => (
  <div className={cx(styles['feed-content-wrapper'], styles['feed-content'])}>
    <h2 className="typography-subtitle2">
      <FormattedMessage
        id="{titleId}"
        defaultMessage="{titleDefault}"
        description="{titleDescription}"
        values={{ titleId, titleDefault, titleDescription }}
      />
    </h2>
    <p className="typography-body1">
      <FormattedHTMLMessage
        id="{contentId}"
        defaultMessage="{contentDefault}"
        description="{contentDescription}"
        values={{ contentId, contentDefault, contentDescription }}
      />
    </p>
  </div>
);


const FeedPageContent = ({ team }) => {
  const handleCreateFeed = () => {
    browserHistory.push(`/${team.slug}/feed/create`);
  };

  return (
    <>
      <div className={styles['feed-page-header']}>
        <div>
          <div className={cx(styles.feedPageTitleWrapper)}>
            <div className={cx(styles.feedHeaderTitle)}>
              <h6>
                <FeedIcon />
                Shared Feeds
              </h6>
            </div>
          </div>
        </div>
      </div>
      <div className={cx(styles['feed-container'])}>
        <div className={cx(styles['feed-section'])}>
          <FeedSection
            titleId="feedSection.sharedFeedsTitle"
            titleDefault="What are Shared Feeds?"
            titleDescription="Title of section about what shared feeds are"
            contentId="feedSection.sharedFeedsContent"
            contentDefault="Unlock new insights across audiences and languages by combining your Tipline data with other workspaces into a single shared view."
            contentDescription="Text explaining what Shared Feeds are"
          />
          <FeedSection
            titleId="feedSection.whatCanBeSharedTitle"
            titleDefault="What can be shared?"
            titleDescription="Title of section about what can be shared in the shared feeds"
            contentId="feedSection.whatCanBeSharedContent"
            contentDefault="Fully control what data each organization will contribute to the shared feed. Share anonymized request information from your Tipline, or create a shared pool of fact-checks, or choose to share everything with your partner workspaces."
            contentDescription="Text explaining what can be shared in the shared feeds"
          />
          <FeedSection
            titleId="feedSection.howToGetStartedTitle"
            titleDefault="How do you get started?"
            titleDescription="Title of section about how to get started with shared feeds"
            contentId="feedSection.howToGetStartedContent"
            contentDefault="Create a new shared feed, and select which data from your workspace you would like to contribute. Then invite one or more other workspaces to participate. All contributing workspaces will share the same data."
            contentDescription="Text explaining how to get started with shared feeds"
          />
          <FeedSection
            titleId="feedSection.whatComesNextTitle"
            titleDefault="What comes next?"
            titleDescription="Title of section about what is coming next for the shared feeds"
            contentId="feedSection.whatComesNextContent"
            contentDefault="With a single view into multiple Tiplines, each workspace accesses a new level of insights including trend narratives across audiences."
            contentDescription="Text about what is coming next for the shared feeds"
          />
        </div>
      </div>
      <Can permissions={team.permissions} permission="create Feed">
        <span className={styles.createFeedButton}>
          <ButtonMain
            className="projects-list__add-feed"
            label={
              <FormattedMessage id="feedComponent.newSharedFeed" defaultMessage="New Shared Feed" description="Button label create new shared feed" />
            }
            iconLeft={<AddIcon />}
            variant="contained"
            size="small"
            theme="brand"
            onClick={(e) => { handleCreateFeed(); e.stopPropagation(); }}
          />
        </span>
      </Can>
    </>
  );
};

export default FeedPageContent;
