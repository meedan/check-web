import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import Select from '../cds/inputs/Select';
import TimelineWidget from '../cds/charts/TimelineWidget';
import CalendarIcon from '../../icons/calendar_month.svg';
import LanguageIcon from '../../icons/language.svg';
import styles from './Dashboard.module.css';

const ArticlesDashboard = ({ team }) => (
  <div className={styles['dashboard-wrapper']}>
    <div className={styles['dashboard-content']}>
      <div className={styles['dashboard-filter-area']}>
        <div>
          <Select
            iconLeft={<CalendarIcon />}
            onChange={() => {}}
          >
            <option value="last-week">Last: 7 days</option>
          </Select>
        </div>
        <div>
          <Select
            iconLeft={<LanguageIcon />}
            onChange={() => {}}
          >
            <option value="all-languages">Languages: All</option>
          </Select>
        </div>
      </div>
      <TimelineWidget
        title="Articles Added & Updated"
      />
      <p>{team.slug}</p>
      <p>{team.get_language}</p>
    </div>
  </div>
);

const ArticlesDashboardQueryRenderer = ({ teamSlug }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ArticlesDashboardQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          slug
          get_language
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
    variables={{ teamSlug }}
  />
);

ArticlesDashboardQueryRenderer.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default ArticlesDashboardQueryRenderer;
