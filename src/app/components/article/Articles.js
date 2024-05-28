import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import { withSetFlashMessage } from '../FlashMessage';
import BlankState from '../layout/BlankState';
import ArticleCard from '../search/SearchResultsCards/ArticleCard';
import searchResultsStyles from '../search/SearchResults.module.css';
import Paginator from '../cds/inputs/Paginator';
import ListSort from '../cds/inputs/ListSort';
import MediasLoading from '../media/MediasLoading';
import ArticleFilters from './ArticleFilters';
import styles from './Articles.module.css';

const pageSize = 50;

const ArticlesComponent = ({
  teamSlug,
  type,
  title,
  icon,
  page,
  sort,
  sortType,
  sortOptions,
  filterOptions,
  filters,
  onChangeSearchParams,
  articles,
  articlesCount,
  updateMutation,
  setFlashMessage,
}) => {
  const handleChangeSort = ({ sort: newSort, sortType: newSortType }) => {
    onChangeSearchParams({
      page: 1,
      sort: newSort,
      sortType: newSortType,
    });
  };

  const handleChangePage = (newPage) => {
    onChangeSearchParams({ page: newPage });
  };

  const handleChangeFilters = (newFilters) => {
    onChangeSearchParams({
      filters: newFilters,
      page: 1,
    });
  };

  const onCompleted = () => {
    setFlashMessage(
      <FormattedMessage
        id="articles.updateTagsSuccess"
        defaultMessage="Tags updated successfully."
        description="Banner displayed after article tags are updated successfully."
      />,
      'success');
  };

  const onError = () => {
    setFlashMessage(
      <FormattedMessage
        id="articles.updateTagsError"
        defaultMessage="Could not update tags, please try again later or connect the support if the error persists."
        description="Banner displayed when article tags can't be updated."
      />,
      'error');
  };

  const handleUpdateTags = (id, tags) => {
    commitMutation(Relay.Store, {
      mutation: updateMutation,
      variables: {
        input: {
          id,
          tags,
        },
      },
      onCompleted,
      onError,
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
          type={type}
          teamSlug={teamSlug}
          filterOptions={filterOptions}
          currentFilters={{ ...filters, article_type: type }}
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
            <Paginator
              page={page}
              pageSize={pageSize}
              numberOfPageResults={articles.length}
              numberOfTotalResults={articlesCount}
              onChangePage={handleChangePage}
            />
          </div>
          : null
        }

        { articles.length === 0 ?
          <BlankState>
            <FormattedMessage
              id="articles.blank"
              defaultMessage="There are no articles here."
              description="Empty message that is displayed when there are no articles to display."
            />
          </BlankState>
          : null
        }

        <div className={styles.articlesList}>
          {articles.map(article => (
            <ArticleCard
              key={article.id}
              title={article.title}
              summary={article.description}
              url={article.url}
              languageCode={article.language}
              date={article.updated_at}
              tags={article.tags}
              onChangeTags={(tags) => {
                handleUpdateTags(article.id, tags);
              }}
            />
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
  type: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
  title: PropTypes.node.isRequired, // <FormattedMessage />
  icon: PropTypes.node.isRequired,
  page: PropTypes.number,
  sort: PropTypes.oneOf(['title', 'language', 'updated_at']),
  sortType: PropTypes.oneOf(['ASC', 'DESC']),
  filters: PropTypes.object,
  teamSlug: PropTypes.string.isRequired,
  onChangeSearchParams: PropTypes.func.isRequired,
  updateMutation: PropTypes.object.isRequired,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  sortOptions: PropTypes.arrayOf(PropTypes.exact({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired, // Localizable string
  })),
  articlesCount: PropTypes.number,
  articles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    url: PropTypes.string,
    language: PropTypes.string,
    updated_at: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
  })),
  setFlashMessage: PropTypes.func.isRequired,
};

const ConnectedArticlesComponent = withSetFlashMessage(ArticlesComponent);

const Articles = ({
  type,
  icon,
  title,
  teamSlug,
  sortOptions,
  filterOptions,
  updateMutation,
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
                    description
                    url
                    language
                    updated_at
                    tags
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
            <ConnectedArticlesComponent
              type={type}
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
              updateMutation={updateMutation}
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
  updateMutation: PropTypes.object.isRequired,
  sortOptions: PropTypes.arrayOf(PropTypes.exact({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired, // Localizable string
  })),
};

export default Articles;
