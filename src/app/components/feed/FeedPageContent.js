import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import AddIcon from '../../icons/add.svg';
import FeedIcon from '../../icons/dynamic_feed.svg';
import styles from './FeedPage.module.css';
import Can from '../Can';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';

const FeedSection = ({
  title, content,
}) => (
  <div className={cx(styles['feed-content-wrapper'], styles['feed-content'])}>
    <h2 className="typography-subtitle2">
      {title}
    </h2>
    <p>
      {content}
    </p>
  </div>
);

FeedSection.propTypes = {
  title: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
};

const FeedPageContent = ({ permissions, slug }) => {
  const handleCreateFeed = () => {
    browserHistory.push(`/${slug}/feed/create`);
  };

  return (
    <>
      <div className={cx(styles['feed-page-header'])}>
        <div className={cx(styles['feed-page-title-wrapper'])}>
          <div className={cx(styles['feed-header-title'])}>
            <h6>
              <FeedIcon />
              <FormattedHTMLMessage
                id="sharedFeeds"
                defaultMessage="Shared Feeds <sup>BETA</sup>"
                description="Title for the shared feeds page"
              />
            </h6>
          </div>
        </div>
      </div>
      <div className={cx(styles['feed-container'])}>
        <div className={cx(styles['feed-section'])}>
          <FeedSection
            title={
              <FormattedMessage
                id="feedSection.sharedFeedsTitle"
                defaultMessage="What are Shared Feeds?"
                description="Title of section about what shared feeds are"
              />
            }
            content={
              <FormattedHTMLMessage
                id="feedSection.sharedFeedsContent"
                defaultMessage="Unlock new insights across audiences and languages by combining your Tipline data with other workspaces into a single shared view."
                description="Text explaining what shared feeds are"
              />
            }
          />
          <FeedSection
            title={
              <FormattedMessage
                id="feedSection.whatCanBeSharedTitle"
                defaultMessage="What can be shared?"
                description="Title of section about what can be shared in the shared feeds"
              />
            }
            content={
              <FormattedHTMLMessage
                id="feedSection.whatCanBeSharedContent"
                defaultMessage="Fully control what data each organization will contribute to the shared feed. Share anonymized request information from your Tipline, or create a shared pool of fact-checks, or choose to share everything with your partner workspaces."
                description="Text explaining what can be shared in the shared feeds"
              />
            }
          />
          <FeedSection
            title={
              <FormattedMessage
                id="feedSection.howToGetStartedTitle"
                defaultMessage="How do you get started?"
                description="Title of section about how to get started with shared feeds"
              />
            }
            content={
              <FormattedHTMLMessage
                id="feedSection.howToGetStartedContent"
                defaultMessage="Create a new shared feed, and select which data from your workspace you would like to contribute. </br> Then invite one or more other workspaces to participate. All contributing workspaces will share the same data."
                description="Text explaining how to use shared feeds."
              />
            }
          />
          <FeedSection
            title={
              <FormattedMessage
                id="feedSection.whatComesNextTitle"
                defaultMessage="What comes next?"
                description="Title of section about what is coming next for the shared feeds"
              />
            }
            content={
              <FormattedHTMLMessage
                id="feedSection.whatComesNextContent"
                defaultMessage="With a single view into multiple Tiplines, each workspace accesses a new level of insights including trend narratives across audiences."
                description="Text about what is coming next for the shared feeds"
              />
            }
          />
        </div>
      </div>
      <Can permissions={permissions} permission="create Feed">
        <span className={styles.createFeedButton}>
          <ButtonMain
            className="projects-list__add-feed"
            label={
              <FormattedMessage id="feedComponent.newSharedFeed" defaultMessage="New Shared Feed" description="Button label create new shared feed" />
            }
            iconLeft={<AddIcon />}
            variant="contained"
            size="default"
            theme="brand"
            onClick={(e) => { handleCreateFeed(); e.stopPropagation(); }}
          />
        </span>
      </Can>
    </>
  );
};

FeedPageContent.propTypes = {
  permissions: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
};

export default FeedPageContent;
