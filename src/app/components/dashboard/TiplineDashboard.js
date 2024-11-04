import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import ListTopMediaTags from './ListTopMediaTags';
import ListTopRequestedMediaClusters from './ListTopRequestedMediaClusters';
import NumberArticlesSent from './NumberArticlesSent';
import NumberAvgResponseTime from './NumberAvgResponseTime';
import NumberConversations from './NumberConversations';
import NumberSubscribers from './NumberSubscribers';
import PlatformSelect from './PlatformSelect';
import StackedBarNewslettersSent from './StackedBarNewslettersSent';
import StackedBarSearchResultsFeedback from './StackedBarSearchResultsFeedback';
import StackedBarSearchResultsByType from './StackedBarSearchResultsByType';
import StackedBarUsers from './StackedBarUsers';
import TimeFrameSelect from './TimeFrameSelect';
import TiplineDataComponent from './TiplineDataComponent';
import TimelineTiplineMessageVolume from './TimelineTiplineMessageVolume';
import VerticalBarMediaReceivedByType from './VerticalBarMediaReceivedByType';
import LanguagePickerSelect from '../cds/inputs/LanguagePickerSelect';
import PageTitle from '../PageTitle';
import ErrorBoundary from '../error/ErrorBoundary';
import Loader from '../cds/loading/Loader';
import { safelyParseJSON } from '../../helpers';
import styles from './Dashboard.module.css';

const TiplineDashboard = ({
  language,
  onChangeLanguage,
  onChangePeriod,
  onChangePlatform,
  period,
  platform,
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
        <PlatformSelect value={platform || 'all'} onChange={onChangePlatform} />
      </div>
      <TimelineTiplineMessageVolume statistics={team.statistics} />
      <div className={styles['dashboard-two-column']}>
        <div className={styles['dashboard-single-column']}>
          <div className={styles['dashboard-combo']}>
            <NumberConversations statistics={team.statistics} />
            <StackedBarSearchResultsFeedback statistics={team.statistics} />
          </div>
          <div className={styles['dashboard-combo']}>
            <NumberAvgResponseTime statistics={team.statistics} />
            <StackedBarUsers statistics={team.statistics} />
          </div>
          <div className={styles['dashboard-combo']}>
            <NumberArticlesSent statistics={team.statistics} />
            <StackedBarSearchResultsByType statistics={team.statistics} />
          </div>
          <div className={styles['dashboard-combo']}>
            <NumberSubscribers statistics={team.statistics} />
            <StackedBarNewslettersSent statistics={team.statistics} />
          </div>
        </div>

        <div className={styles['dashboard-single-column']}>
          <div className={styles['dashboard-two-column']}>
            <ListTopMediaTags statistics={team.statistics} />
            <ListTopRequestedMediaClusters statistics={team.statistics} />
          </div>
          <VerticalBarMediaReceivedByType statistics={team.statistics} />
        </div>
      </div>
      <TiplineDataComponent
        data={team.data_report}
        defaultLanguage={team.get_language}
        slug={team.slug}
      />
    </div>
  </div>
);

TiplineDashboard.defaultProps = {
  language: null,
  platform: null,
};

TiplineDashboard.propTypes = {
  language: PropTypes.string,
  period: PropTypes.string.isRequired,
  platform: PropTypes.string,
  team: PropTypes.shape({
    data_report: PropTypes.object,
    get_language: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    statistics: PropTypes.object.isRequired,
  }).isRequired,
  onChangeLanguage: PropTypes.func.isRequired,
  onChangePeriod: PropTypes.func.isRequired,
  onChangePlatform: PropTypes.func.isRequired,
};

const TiplineDashboardQueryRenderer = ({ routeParams }) => {
  const [period, setPeriod] = React.useState('past_month');
  const [language, setLanguage] = React.useState(null);
  const [platform, setPlatform] = React.useState(null);

  const handlePeriodChange = e => setPeriod(e.target.value);

  const handleLanguageChange = (obj) => {
    const { languageCode } = obj;
    setLanguage(languageCode === 'all' ? null : languageCode);
  };

  const handlePlatformChange = (event) => {
    setPlatform(event.target.value === 'all' ? null : event.target.value);
  };

  return (
    <PageTitle title={<FormattedMessage defaultMessage="Tipline Dashboard" description="Title of the dashboard page." id="tiplineDashboard.title" />}>
      <ErrorBoundary component="TiplineDashboard">
        <QueryRenderer
          environment={Relay.Store}
          query={graphql`
            query TiplineDashboardQuery($teamSlug: String!, $period: String!, $platform: String, $language: String) {
              team(slug: $teamSlug) {
                slug
                get_language
                get_languages
                data_report
                statistics(period: $period, platform: $platform, language: $language) {
                  ...ListTopMediaTags_statistics
                  ...ListTopRequestedMediaClusters_statistics
                  ...NumberArticlesSent_statistics
                  ...NumberAvgResponseTime_statistics
                  ...NumberConversations_statistics
                  ...NumberSubscribers_statistics
                  ...StackedBarNewslettersSent_statistics
                  ...StackedBarSearchResultsFeedback_statistics
                  ...StackedBarSearchResultsByType_statistics
                  ...StackedBarUsers_statistics
                  ...TimelineTiplineMessageVolume_statistics
                  ...VerticalBarMediaReceivedByType_statistics
                }
              }
            }
          `}
          render={({ error, props }) => {
            if (!error && props) {
              const { team } = props;

              return (
                <TiplineDashboard
                  language={language}
                  period={period}
                  platform={platform}
                  team={team}
                  onChangeLanguage={handleLanguageChange}
                  onChangePeriod={handlePeriodChange}
                  onChangePlatform={handlePlatformChange}
                />
              );
            }

            // TODO: We need a better error handling in the future, standardized with other components
            return <Loader size="large" text={<FormattedMessage defaultMessage="Fetching latest data, please wait…" description="Loading message of the dashboard page." id="tiplineDashboard.loading" />} theme="white" variant="page" />;
          }}
          variables={{
            language,
            period,
            platform,
            teamSlug: routeParams.team,
          }}
        />
      </ErrorBoundary>
    </PageTitle>
  );
};

TiplineDashboardQueryRenderer.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default TiplineDashboardQueryRenderer;
