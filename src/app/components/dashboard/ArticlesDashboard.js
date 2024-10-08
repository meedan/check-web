import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import TimeFrameSelect from './TimeFrameSelect';
import LanguageSelect from './LanguageSelect';
import TimelineWidget from '../cds/charts/TimelineWidget';
import NumberWidget from '../cds/charts/NumberWidget';
import ListWidget from '../cds/charts/ListWidget';
import styles from './Dashboard.module.css';

const ArticlesDashboard = ({ team }) => (
  <div className={styles['dashboard-wrapper']}>
    <div className={styles['dashboard-content']}>
      <div className={styles['dashboard-filter-area']}>
        <TimeFrameSelect />
        <LanguageSelect languages={team.get_languages} />
      </div>
      <TimelineWidget
        data={[
          { date: '2018-01-01', value: 0 },
          { date: '2018-01-02', value: 0 },
          { date: '2018-01-03', value: 0 },
          { date: '2018-01-04', value: 0 },
          { date: '2018-01-05', value: 0 },
          { date: '2018-01-06', value: 0 },
          { date: '2018-01-07', value: 0 },
        ]}
        title="Articles Added & Updated"
      />
      <div className={styles['dashboard-two-column']}>
        <div className={styles['dashboard-two-column']}>
          <NumberWidget itemCount={999} title="Explainers Created" />
          <NumberWidget itemCount={999} title="Fact-Checks Created" />
        </div>
        <div className={styles['dashboard-two-column']}>
          <ListWidget
            items={[
              { itemText: 'Article 1', itemValue: 999 },
              { itemText: 'Article 2', itemValue: 888 },
              { itemText: 'Article 3', itemValue: 777 },
              { itemText: 'Article 4', itemValue: 666 },
              { itemText: 'Article 5', itemValue: 555 },
            ]}
            title="Top Explainers Sent"
          />
          <ListWidget
            items={[
              { itemText: 'Article 1', itemValue: 999 },
              { itemText: 'Article 2', itemValue: 888 },
              { itemText: 'Article 3', itemValue: 777 },
              { itemText: 'Article 4', itemValue: 666 },
              { itemText: 'Article 5', itemValue: 555 },
            ]}
            title="Top Article Tags"
          />
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
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        const { team } = props;

        return (<ArticlesDashboard team={team} />);
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
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
