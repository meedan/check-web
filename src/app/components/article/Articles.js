import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import searchResultsStyles from '../search/SearchResults.module.css';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ListSort from '../cds/inputs/ListSort';
import NextIcon from '../../icons/chevron_right.svg';
import PrevIcon from '../../icons/chevron_left.svg';
import styles from './Articles.module.css';
import MediasLoading from '../media/MediasLoading';
import ArticleFilters from './ArticleFilters';

const pageSize = 50;

const ArticlesComponent = ({
  title,
  icon,
  page,
  sort,
  sortType,
  sortOptions,
  filterOptions,
  filters,
  onChangeSearchParams,
  teamSlug,
  articles,
  articlesCount,
}) => {
  const startingIndex = (page - 1) * pageSize;
  const endingIndex = startingIndex + (articles.length - 1);

  const handleChangeSort = ({ sort: newSort, sortType: newSortType }) => {
    onChangeSearchParams({
      page: 1,
      sort: newSort,
      sortType: newSortType,
    });
  };

  const handleGoToPreviousPage = () => {
    if (page > 1) {
      onChangeSearchParams({
        page: (page - 1),
      });
    }
  };

  const handleGoToNextPage = () => {
    if (endingIndex + 1 < articlesCount) {
      onChangeSearchParams({
        page: (page + 1),
      });
    }
  };

  const handleChangeFilters = (newFilters) => {
    onChangeSearchParams({
      filters: newFilters,
      page: 1,
    });
  };

  return (
    <React.Fragment>
      <div className={cx(searchResultsStyles['search-results-header'], styles.articlesHeader)}>
        <div className={searchResultsStyles.searchResultsTitleWrapper}>
          <div className={searchResultsStyles.searchHeaderTitle}>
            <h6>
              {icon}
              {title}
            </h6>
          </div>
        </div>
      </div>
      <div className={cx(searchResultsStyles['search-results-wrapper'], styles.articlesFilters)}>
        <ArticleFilters
          teamSlug={teamSlug}
          filterOptions={filterOptions}
          currentFilters={filters}
          className={styles.articleFilterBar}
          onSubmit={handleChangeFilters}
        />
      </div>
      <div className={cx(searchResultsStyles['search-results-wrapper'], styles.articles)}>
        { articles.length > 0 ?
          <div className={styles.articlesToolbar}>
            <ListSort
              sort={sort}
              sortType={sortType}
              options={sortOptions}
              onChange={handleChangeSort}
            />
            <div className={styles.articlesPagination}>
              <Tooltip title={<FormattedMessage id="articles.previousPage" defaultMessage="Previous page" description="Pagination button to go to previous page." />}>
                <ButtonMain
                  onClick={handleGoToPreviousPage}
                  iconCenter={<PrevIcon />}
                  disabled={page === 1}
                  theme="text"
                  variant="text"
                />
              </Tooltip>
              <span className="typography-button">
                <FormattedMessage
                  id="articles.itemsCount"
                  defaultMessage="{count, plural, one {1 / 1} other {{from} - {to} / #}}"
                  description="Pagination count of items returned"
                  values={{
                    from: startingIndex + 1,
                    to: endingIndex + 1,
                    count: articlesCount,
                  }}
                />
              </span>
              <Tooltip title={<FormattedMessage id="articles.nextPage" defaultMessage="Next page" description="Pagination button to go to next page." />}>
                <ButtonMain
                  onClick={handleGoToNextPage}
                  iconCenter={<NextIcon />}
                  disabled={endingIndex + 1 === articlesCount}
                  theme="text"
                  variant="text"
                />
              </Tooltip>
            </div>
          </div>
          : null
        }

        { articles.length === 0 ? // TODO: Add blank state like <FeedBlankState />
          <div>
            No results found!
          </div>
          : null
        }

        <div className={styles.articlesList}>
          {articles.map(article => ( // TODO: Use card component
            <div key={article.id}>{article.title}</div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

ArticlesComponent.defaultProps = {
  page: 1,
  sort: 'title',
  sortType: 'ASC',
  sortOptions: [],
  filterOptions: [],
  filters: {},
  articles: [],
  articlesCount: 0,
};

ArticlesComponent.propTypes = {
  title: PropTypes.node.isRequired, // <FormattedMessage />
  icon: PropTypes.node.isRequired,
  page: PropTypes.number,
  sort: PropTypes.oneOf(['title', 'language', 'updated_at']),
  sortType: PropTypes.oneOf(['ASC', 'DESC']),
  filters: PropTypes.object,
  teamSlug: PropTypes.string.isRequired,
  onChangeSearchParams: PropTypes.func.isRequired,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  sortOptions: PropTypes.arrayOf(PropTypes.exact({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired, // Localizable string
  })),
  articlesCount: PropTypes.number,
  articles: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
  })),
};

const Articles = ({
  type,
  icon,
  title,
  teamSlug,
  sortOptions,
  filterOptions,
}) => {
  const [searchParams, setSearchParams] = React.useState({
    page: 1,
    sort: 'title',
    sortType: 'ASC',
    filters: {},
  });
  const {
    page,
    sort,
    sortType,
    filters,
  } = searchParams;

  const handleChangeSearchParams = (newSearchParams) => { // { page, sort, sortType, filters } - a single state for a single query/render
    setSearchParams(Object.assign({}, searchParams, newSearchParams));
  };

  // Adjust some filters
  if (filters.range?.updated_at) {
    filters.updatedAt = JSON.stringify(filters.range.updated_at);
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query ArticlesQuery(
          $slug: String!, $type: String!, $pageSize: Int, $sort: String, $sortType: String, $offset: Int,
          $users: [Int], $updatedAt: String, $tags: [String],
        ) {
          team(slug: $slug) {
            articles_count(article_type: $type)
            articles(
              first: $pageSize, article_type: $type, offset: $offset, sort: $sort, sort_type: $sortType,
              user_ids: $users, tags: $tags, updated_at: $updatedAt,
            ) {
              edges {
                node {
                  ... on Explainer {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      `}
      variables={{
        slug: teamSlug,
        type,
        pageSize,
        sort,
        sortType,
        offset: pageSize * (page - 1),
        ...filters,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return (
            <ArticlesComponent
              title={title}
              icon={icon}
              page={page}
              sort={sort}
              sortType={sortType}
              sortOptions={sortOptions}
              filterOptions={filterOptions}
              teamSlug={teamSlug}
              filters={filters}
              articles={props.team.articles.edges.map(edge => edge.node)}
              articlesCount={props.team.articles_count}
              onChangeSearchParams={handleChangeSearchParams}
            />
          );
        }
        return <MediasLoading theme="white" variant="page" size="large" />;
      }}
    />
  );
};

Articles.defaultProps = {
  sortOptions: [],
  filterOptions: [],
};

Articles.propTypes = {
  type: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
  title: PropTypes.node.isRequired, // <FormattedMessage />
  icon: PropTypes.node.isRequired,
  teamSlug: PropTypes.string.isRequired,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  sortOptions: PropTypes.arrayOf(PropTypes.exact({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired, // Localizable string
  })),
};

export default Articles;
