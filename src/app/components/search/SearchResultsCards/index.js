/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ArticleCard from './ArticleCard';
import searchResultsStyles from '../SearchResults.module.css';

const SearchResultsCards = ({ projectMedias, team }) => (
  <div className={cx('search-results-cards', searchResultsStyles['search-results-scroller'])}>
    { projectMedias.map((projectMedia) => {
      const values = projectMedia.feed_columns_values;
      const status = team.verification_statuses.statuses.find(s => s.id === values.status) || {};

      return (
        <div className="fact-check-card-wrapper" key={values.fact_check_title}>
          <ArticleCard
            date={values.updated_at_timestamp}
            statusColor={status.style?.color}
            statusLabel={status.label || values.status}
            summary={values.fact_check_summary}
            teamAvatar={values.team_avatar}
            teamName={values?.team_name}
            title={values.fact_check_title || projectMedia.title}
            url={values.fact_check_url}
            variant="fact-check"
          />
        </div>
      );
    })}
  </div>
);

SearchResultsCards.propTypes = {
  team: PropTypes.shape({
    verification_statuses: PropTypes.shape({
      statuses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        style: PropTypes.shape({
          color: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired),
    }).isRequired,
  }).isRequired,
  projectMedias: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    feed_columns_values: PropTypes.shape({
      fact_check_title: PropTypes.string.isRequired,
      updated_at_timestamp: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      fact_check_summary: PropTypes.string,
      fact_check_url: PropTypes.string,
      team_avatar: PropTypes.string.isRequired, // URL
    }).isRequired,
  }).isRequired).isRequired,
};

export default SearchResultsCards;
