import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import TimeFrameSelect from './TimeFrameSelect';
import LanguageSelect from './LanguageSelect';
import ListTopArticlesSent from './ListTopArticlesSent';
import ListTopArticlesTags from './ListTopArticlesTags';
import NumberArticlesSent from './NumberArticlesSent';
import NumberExplainersCreated from './NumberExplainersCreated';
import NumberFactChecksCreated from './NumberFactChecksCreated';
import NumberPublishedFactChecks from './NumberPublishedFactChecks';
import StackedBarSearchResultsByType from './StackedBarSearchResultsByType';
import TimelineArticlesCreatedAndUpdated from './TimelineArticlesCreatedAndUpdated';
import VerticalBarFactChecksByRating from './VerticalBarFactChecksByRating';
import MediasLoading from '../media/MediasLoading';
import styles from './Dashboard.module.css';

const ArticlesDashboard = ({ team }) => (
  <div className={styles['dashboard-wrapper']}>
    <div className={styles['dashboard-content']}>
      <div className={styles['dashboard-filter-area']}>
        <TimeFrameSelect />
        <LanguageSelect languages={team.get_languages} />
      </div>
      <TimelineArticlesCreatedAndUpdated statistics={team.statistics} />
      <div className={styles['dashboard-two-column']}>
        <div className={styles['dashboard-single-column']}>
          <div className={styles['dashboard-two-column']}>
            <NumberExplainersCreated statistics={team.statistics} />
            <NumberFactChecksCreated statistics={team.statistics} />
          </div>
          <NumberPublishedFactChecks statistics={team.statistics} />
          <div className={styles['dashboard-combo']}>
            <NumberArticlesSent statistics={team.statistics} />
            <StackedBarSearchResultsByType statistics={team.statistics} />
          </div>
        </div>

        <div className={styles['dashboard-single-column']}>
          <div className={styles['dashboard-two-column']}>
            <ListTopArticlesSent statistics={team.statistics} />
            <ListTopArticlesTags statistics={team.statistics} />
          </div>
          <VerticalBarFactChecksByRating statistics={team.statistics} />
        </div>
      </div>
    </div>
  </div>
);

const ArticlesDashboardQueryRenderer = ({ routeParams }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ArticlesDashboardQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          get_languages
          statistics(period: "last_week") {
            ...ListTopArticlesSent_statistics
            ...ListTopArticlesTags_statistics
            ...NumberArticlesSent_statistics
            ...NumberExplainersCreated_statistics
            ...NumberFactChecksCreated_statistics
            ...NumberPublishedFactChecks_statistics
            ...StackedBarSearchResultsByType_statistics
            ...TimelineArticlesCreatedAndUpdated_statistics
            ...VerticalBarFactChecksByRating_statistics
          }
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        const { team } = props;

        return (<ArticlesDashboard team={team} />);
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return <MediasLoading size="large" theme="white" variant="page" />;
    }}
    variables={{ teamSlug: routeParams.team }}
  />
);

ArticlesDashboardQueryRenderer.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default ArticlesDashboardQueryRenderer;
