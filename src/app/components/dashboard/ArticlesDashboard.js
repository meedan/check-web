import React from 'react';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import TimeFrameSelect from './TimeFrameSelect';
import ListTopArticlesSent from './ListTopArticlesSent';
import ListTopArticlesTags from './ListTopArticlesTags';
import NumberArticlesSent from './NumberArticlesSent';
import NumberExplainersCreated from './NumberExplainersCreated';
import NumberFactChecksCreated from './NumberFactChecksCreated';
import NumberPublishedFactChecks from './NumberPublishedFactChecks';
import StackedBarSearchResultsByType from './StackedBarSearchResultsByType';
import TimelineArticlesCreatedAndUpdated from './TimelineArticlesCreatedAndUpdated';
import VerticalBarFactChecksByRating from './VerticalBarFactChecksByRating';
import PageTitle from '../PageTitle';
import ErrorBoundary from '../error/ErrorBoundary';
import LanguagePickerSelect from '../cds/inputs/LanguagePickerSelect';
import Loader from '../cds/loading/Loader';
import { safelyParseJSON } from '../../helpers';
import styles from './Dashboard.module.css';

const ArticlesDashboard = ({
  language,
  onChangeLanguage,
  onChangePeriod,
  period,
  team,
}) => (
  <div className={styles['dashboard-wrapper']}>
    <div className={styles['dashboard-content']}>
      <div className={styles['dashboard-filter-area']}>
        <TimeFrameSelect value={period} onChange={onChangePeriod} />
        <LanguagePickerSelect
          allowAllLanguages
          languages={safelyParseJSON(team.get_languages) || ['en']}
          selectedLanguage={language || 'all'}
          onSubmit={onChangeLanguage}
        />
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
          <VerticalBarFactChecksByRating
            language={language}
            statistics={team.statistics}
            team={team}
          />
        </div>
      </div>
    </div>
  </div>
);

ArticlesDashboard.defaultProps = {
  language: null,
};

ArticlesDashboard.propTypes = {
  language: PropTypes.string,
  period: PropTypes.string.isRequired,
  team: PropTypes.shape({
    get_languages: PropTypes.string.isRequired,
    statistics: PropTypes.object.isRequired,
  }).isRequired,
  onChangeLanguage: PropTypes.func.isRequired,
  onChangePeriod: PropTypes.func.isRequired,
};

const ArticlesDashboardQueryRenderer = ({ routeParams }) => {
  const [period, setPeriod] = React.useState('past_month');
  const [language, setLanguage] = React.useState(null);

  const handlePeriodChange = e => setPeriod(e.target.value);

  const handleLanguageChange = (obj) => {
    const { languageCode } = obj;
    setLanguage(languageCode === 'all' ? null : languageCode);
  };

  return (
    <PageTitle title={<FormattedMessage defaultMessage="Articles Dashboard" description="Title of the dashboard page." id="articlesDashboard.title" />}>
      <ErrorBoundary component="ArticlesDashboard">
        <QueryRenderer
          environment={Relay.Store}
          query={graphql`
            query ArticlesDashboardQuery($teamSlug: String!, $period: String!, $language: String) {
              team(slug: $teamSlug) {
                get_languages
                ...VerticalBarFactChecksByRating_team
                statistics(period: $period, language: $language) {
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

              return (
                <ArticlesDashboard
                  language={language}
                  period={period}
                  team={team}
                  onChangeLanguage={handleLanguageChange}
                  onChangePeriod={handlePeriodChange}
                />
              );
            }

            // TODO: We need a better error handling in the future, standardized with other components
            return <Loader size="large" text={<FormattedMessage defaultMessage="Fetching latest data, please wait…" description="Loading message of the dashboard page." id="articlesDashboard.loading" />} theme="white" variant="page" />;
          }}
          variables={{
            teamSlug: routeParams.team,
            period,
            language,
          }}
        />
      </ErrorBoundary>
    </PageTitle>
  );
};

ArticlesDashboardQueryRenderer.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default ArticlesDashboardQueryRenderer;
