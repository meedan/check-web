/* eslint-disable react/sort-prop-types */
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import AddIcon from '../../icons/add.svg';
import SharedFeedIcon from '../../icons/dynamic_feed.svg';
import Can from '../Can';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import PageTitle from '../PageTitle';
import styles from './FeedPage.module.css';

const FeedSection = ({
  content, title,
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

const FeedPageContent = ({ name, permissions, slug }) => {
  const handleCreateFeed = () => {
    browserHistory.push(`/${slug}/feed/create`);
  };

  return (
    <>
      <PageTitle
        prefix={
          <FormattedMessage
            defaultMessage="Shared Feeds"
            description="Page title for the Shared Feeds page"
            id="feedPageContent.pageTitle"
          />
        }
        team={{ name }}
      >
        <div className={cx(styles['feed-page-header'])}>
          <div className={cx(styles['feed-page-title-wrapper'])}>
            <div className={cx(styles['feed-header-title'])}>
              <h6>
                <SharedFeedIcon />
                <FormattedHTMLMessage
                  defaultMessage="Shared Feeds <sup>BETA</sup>"
                  description="Title for the shared feeds page"
                  id="sharedFeeds"
                />
              </h6>
            </div>
          </div>
        </div>
        <div className={cx(styles['feed-container'])}>
          <div className={cx(styles['feed-section'])}>
            <FeedSection
              content={
                <FormattedHTMLMessage
                  defaultMessage="Unlock new insights across audiences and languages by combining your Tipline data with other workspaces into a single shared view."
                  description="Text explaining what shared feeds are"
                  id="feedSection.sharedFeedsContent"
                />
              }
              title={
                <FormattedMessage
                  defaultMessage="What are Shared Feeds?"
                  description="Title of section about what shared feeds are"
                  id="feedSection.sharedFeedsTitle"
                />
              }
            />
            <FeedSection
              content={
                <FormattedHTMLMessage
                  defaultMessage="Fully control what data each organization will contribute to the shared feed. Share anonymized request information from your Tipline, or create a shared pool of fact-checks, or choose to share everything with your partner workspaces."
                  description="Text explaining what can be shared in the shared feeds"
                  id="feedSection.whatCanBeSharedContent"
                />
              }
              title={
                <FormattedMessage
                  defaultMessage="What can be shared?"
                  description="Title of section about what can be shared in the shared feeds"
                  id="feedSection.whatCanBeSharedTitle"
                />
              }
            />
            <FeedSection
              content={
                <FormattedHTMLMessage
                  defaultMessage="Create a new shared feed, and select which data from your workspace you would like to contribute. </br> Then invite one or more other workspaces to participate. All contributing workspaces will share the same data."
                  description="Text explaining how to use shared feeds."
                  id="feedSection.howToGetStartedContent"
                />
              }
              title={
                <FormattedMessage
                  defaultMessage="How do you get started?"
                  description="Title of section about how to get started with shared feeds"
                  id="feedSection.howToGetStartedTitle"
                />
              }
            />
            <FeedSection
              content={
                <FormattedHTMLMessage
                  defaultMessage="With a single view into multiple Tiplines, each workspace accesses a new level of insights including trend narratives across audiences."
                  description="Text about what is coming next for the shared feeds"
                  id="feedSection.whatComesNextContent"
                />
              }
              title={
                <FormattedMessage
                  defaultMessage="What comes next?"
                  description="Title of section about what is coming next for the shared feeds"
                  id="feedSection.whatComesNextTitle"
                />
              }
            />
          </div>
        </div>
        <Can permission="create Feed" permissions={permissions}>
          <span className={styles.createFeedButton}>
            <ButtonMain
              className="projects-list__add-feed"
              iconLeft={<AddIcon />}
              label={
                <FormattedMessage defaultMessage="New Shared Feed" description="Button label create new shared feed" id="feedComponent.newSharedFeed" />
              }
              size="default"
              theme="info"
              variant="contained"
              onClick={(e) => { handleCreateFeed(); e.stopPropagation(); }}
            />
          </span>
        </Can>
      </PageTitle>
    </>
  );
};

FeedPageContent.propTypes = {
  permissions: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default FeedPageContent;
