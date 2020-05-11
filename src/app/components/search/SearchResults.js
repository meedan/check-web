import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import sortby from 'lodash.sortby';
import styled from 'styled-components';
import NextIcon from '@material-ui/icons/KeyboardArrowRight';
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft';
import Tooltip from '@material-ui/core/Tooltip';
import { withPusher, pusherShape } from '../../pusher';
import SearchQuery from './SearchQuery';
import Toolbar from './Toolbar';
import ParsedText from '../ParsedText';
import BulkActions from '../media/BulkActions';
import MediasLoading from '../media/MediasLoading';
import ProjectBlankState from '../project/ProjectBlankState';
import { searchPrefixFromUrl, searchQueryFromUrl, urlFromSearchQuery } from './Search';
import { black87, headline, units, Row } from '../../styles/js/shared';
import SearchResultsTable from './SearchResultsTable';
import CheckContext from '../../CheckContext';
import SearchRoute from '../../relay/SearchRoute';

// TODO Make this a config
const pageSize = 20;

const messages = defineMessages({
  previousPage: {
    id: 'search.previousPage',
    defaultMessage: 'Previous page',
  },
  nextPage: {
    id: 'search.nextPage',
    defaultMessage: 'Next page',
  },
});

const StyledListHeader = styled.div`
  padding: 0 ${units(2)};

  .search__list-header-filter-row {
    justify-content: space-between;
    display: flex;
  }

  .search__list-header-title-and-filter {
    justify-content: space-between;
    display: flex;
    width: 66%;
  }

  .search-query {
    margin-left: auto;
  }

  .project__title {
    max-width: 35%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .project__description {
    max-width: 30%;
    max-height: ${units(4)};
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledSearchResultsWrapper = styled.div`
  margin: 0 -${units(2)} 0 0;

  .search__results-heading {
    color: ${black87};
    font-size: larger;
    font-weight: bolder;
    text-align: center;
    display: flex;
    align-items: center;

    .search__nav {
      padding: 0 ${units(1)};
      display: flex;
      cursor: pointer;
      color: ${black87};
    }
  }
`;

/* eslint jsx-a11y/click-events-have-key-events: 0 */
class SearchResultsComponent extends React.PureComponent {
  static mergeResults(medias, sources) {
    if (medias.length === 0 && sources.length === 0) {
      return [];
    }
    if (sources.length === 0) {
      return medias;
    }
    if (medias.length === 0) {
      return sources;
    }
    const query = searchQueryFromUrl();
    const comparisonField = query.sort === 'recent_activity'
      ? o => o.node.updated_at
      : o => o.node.published;

    const results = sortby(Array.concat(medias, sources), comparisonField);
    return query.sort_type !== 'ASC' ? results.reverse() : results;
  }

  constructor(props) {
    super(props);

    this.pusherChannel = null;

    this.state = {
      selectedProjectMediaIds: [],
    };
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentDidUpdate() {
    this.resubscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onUnselectAll = () => {
    this.setState({ selectedProjectMediaIds: [] });
  };

  getContext() {
    return new CheckContext(this);
  }

  setOffset(offset) {
    const team = this.props.search.team || this.currentContext().team;
    const project = this.props.project || this.currentContext().project;
    const query = Object.assign({}, searchQueryFromUrl());
    query.esoffset = offset;

    let path = null;
    if (/\/trash/.test(window.location.pathname)) {
      path = `/${team.slug}/trash`;
    }
    if (!path) {
      path = project
        ? `/${team.slug}/project/${project.dbid}`
        : `/${team.slug}/all-items`;
    }

    const url = urlFromSearchQuery(query, path);

    browserHistory.push(url);
  }

  previousPage() {
    const query = Object.assign({}, searchQueryFromUrl());
    const offset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
    if (offset > 0) {
      this.setOffset(offset - pageSize);
    }
  }

  nextPage() {
    const count = this.props.search ? this.props.search.number_of_results : 0;
    const query = Object.assign({}, searchQueryFromUrl());
    const offset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
    if (offset + pageSize < count) {
      this.setOffset(offset + pageSize);
    }
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  resubscribe() {
    const { pusher, clientSessionId, search } = this.props;

    if (this.pusherChannel !== search.pusher_channel) {
      this.unsubscribe();
    }

    if (search.pusher_channel) {
      const channel = search.pusher_channel;
      this.pusherChannel = channel;

      pusher.subscribe(channel).bind('bulk_update_end', 'Search', (data, run) => {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `search-${channel}`,
          callback: this.props.relay.forceFetch,
        };
      });

      pusher.subscribe(channel).bind('media_updated', 'Search', (data, run) => {
        if (clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `search-${channel}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    if (this.pusherChannel) {
      this.props.pusher.unsubscribe(this.pusherChannel);
      this.pusherChannel = null;
    }
  }

  handleChangeSelectedIds = (selectedProjectMediaIds) => {
    this.setState({ selectedProjectMediaIds });
  }

  handleChangeSortParams = (sortParams) => {
    const oldQuery = searchQueryFromUrl();
    let newQuery;
    if (sortParams === null) {
      newQuery = { ...oldQuery };
      delete newQuery.sort;
      delete newQuery.sort_type;
    } else {
      const { key, ascending } = sortParams;
      newQuery = { ...oldQuery, sort: key, sort_type: ascending ? 'ASC' : 'DESC' };
    }

    const prefix = searchPrefixFromUrl();
    browserHistory.push(urlFromSearchQuery(newQuery, prefix));
  }

  handleClickRow = (ev, projectMedia) => {
    const projectId = projectMedia.project_id;
    const teamSlug = this.props.team;
    let mediaUrl;
    if (projectId && projectMedia.dbid) {
      mediaUrl = `/${teamSlug}/project/${projectId}/media/${projectMedia.dbid}`;
    } else if (projectMedia.dbid) {
      mediaUrl = `/${teamSlug}/media/${projectMedia.dbid}`;
    } else {
      return;
    }

    const originalQuery = searchQueryFromUrl();
    const query = { original: originalQuery, ...originalQuery };
    if (Array.isArray(query.show)) {
      query.show = query.show.filter(f => f !== 'sources');
    }
    if (projectId) {
      query.parent = { type: 'project', id: projectId };
      query.projects = [projectId];
      query.referer = 'project';
    } else {
      query.parent = { type: 'team', slug: teamSlug };
      query.referer = 'search';
    }
    const isTrash = /\/trash/.test(window.location.pathname);
    if (isTrash) {
      query.archived = 1;
      query.referer = 'trash';
    }
    query.timestamp = new Date().getTime();

    const itemOffset = (originalQuery.esoffset || 0) +
      Array.prototype.indexOf.call(ev.target.parentNode.childNodes, ev.target);
    query.esoffset = itemOffset;

    browserHistory.push(mediaUrl, { query });
  };

  render() {
    const medias = this.props.search.medias ? this.props.search.medias.edges : [];
    const sources = this.props.search.sources ? this.props.search.sources.edges : [];

    const searchResults = SearchResultsComponent.mergeResults(medias, sources)
      .map(({ node }) => node);
    const count = this.props.search ? this.props.search.number_of_results : 0;
    const team = this.props.search.team || this.currentContext().team;
    const isIdInSearchResults = wantedId => searchResults.some(({ id }) => id === wantedId);
    const selectedProjectMediaIds = this.state.selectedProjectMediaIds.filter(isIdInSearchResults);

    const query = Object.assign({}, searchQueryFromUrl());
    const offset = query.esoffset ? parseInt(query.esoffset, 10) : 0;
    const to = Math.min(count, Math.max(offset + pageSize, searchResults.length));
    const isProject = /\/project\//.test(window.location.pathname);

    const searchQueryProps = {
      project: this.props.project,
      team: this.props.team,
      fields: this.props.fields,
      title: this.props.title,
    };

    let content = null;

    if (count === 0) {
      if (isProject) {
        content = <ProjectBlankState project={this.currentContext().project} />;
      }
    } else {
      content = (
        <SearchResultsTable
          projectMedias={searchResults}
          team={team}
          selectedIds={selectedProjectMediaIds}
          sortParams={query.sort ? {
            key: query.sort,
            ascending: query.sort_type !== 'DESC',
          } : null}
          onChangeSelectedIds={this.handleChangeSelectedIds}
          onChangeSortParams={this.handleChangeSortParams}
          onClickRow={this.handleClickRow}
        />
      );
    }

    const { listName, listActions, listDescription } = this.props;

    return (
      <React.Fragment>
        <StyledListHeader>
          <Row className="search__list-header-filter-row">
            <Row className="search__list-header-title-and-filter">
              <div style={{ font: headline }} className="project__title">
                {listName}
              </div>
              <SearchQuery
                className="search-query"
                project={this.currentContext().project}
                {...searchQueryProps}
                team={team}
              />
            </Row>
            {listActions}
          </Row>
          <Row className="project__description">
            {listDescription && listDescription.trim().length ?
              <ParsedText text={listDescription} />
              : null}
          </Row>
        </StyledListHeader>
        <StyledSearchResultsWrapper className="search__results results">
          <Toolbar
            team={team}
            actions={medias.length ?
              <BulkActions
                parentComponent={this}
                count={this.props.search ? this.props.search.number_of_results : 0}
                team={team}
                page={this.props.page}
                project={this.currentContext().project}
                selectedMedia={selectedProjectMediaIds}
                onUnselectAll={this.onUnselectAll}
              /> : null}
            title={
              <span className="search__results-heading">
                <Tooltip title={this.props.intl.formatMessage(messages.previousPage)}>
                  <span
                    className="search__previous-page search__nav"
                    onClick={this.previousPage.bind(this)}
                    style={{
                      paddingLeft: '0',
                    }}
                  >
                    <PrevIcon style={{ opacity: offset <= 0 ? '0.25' : '1' }} />
                  </span>
                </Tooltip>
                <span className="search__count">
                  <FormattedMessage
                    id="searchResults.itemsCount"
                    defaultMessage="{count, plural, =0 {&nbsp;} one {1 / 1} other {{from} - {to} / #}}"
                    values={{
                      from: offset + 1,
                      to,
                      count,
                    }}
                  />
                  {selectedProjectMediaIds.length ?
                    <span>&nbsp;
                      <FormattedMessage
                        id="searchResults.withSelection"
                        defaultMessage="{selectedCount, plural, =0 {} one {(1 selected)} other {(# selected)}}"
                        values={{
                          selectedCount: selectedProjectMediaIds.length,
                        }}
                      />
                    </span> : null
                  }
                </span>
                <Tooltip title={this.props.intl.formatMessage(messages.nextPage)}>
                  <span
                    className="search__next-page search__nav"
                    onClick={this.nextPage.bind(this)}
                  >
                    <NextIcon style={{ opacity: to >= count ? '0.25' : '1' }} />
                  </span>
                </Tooltip>
              </span>
            }
            project={isProject ? this.currentContext().project : null}
            page={this.props.page}
            search={this.props.search}
          />
          {content}
        </StyledSearchResultsWrapper>
      </React.Fragment>
    );
  }
}

SearchResultsComponent.contextTypes = {
  store: PropTypes.object,
};

SearchResultsComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

const ConnectedSearchResultsComponent = withPusher(injectIntl(SearchResultsComponent));

const SearchResultsContainer = Relay.createContainer(ConnectedSearchResultsComponent, {
  initialVariables: {
    pageSize,
  },
  fragments: {
    search: () => Relay.QL`
      fragment on CheckSearch {
        id,
        pusher_channel,
        team {
          slug
          search_id,
          permissions,
          search { id, number_of_results },
          check_search_trash { id, number_of_results },
          verification_statuses,
          medias_count,
          team_bot_installations(first: 10000) {
            edges {
              node {
                id
                team_bot: bot_user {
                  id
                  identifier
                }
              }
            }
          }
        }
        medias(first: $pageSize) {
          edges {
            node {
              id,
              dbid,
              picture,
              title,
              description,
              virality,
              demand,
              linked_items_count,
              type,
              status,
              first_seen: created_at,
              last_seen,
              share_count,
              project_id,
              verification_statuses,
            }
          }
        },
        number_of_results
      }
    `,
  },
});

// eslint-disable-next-line react/no-multi-comp
class SearchResults extends React.PureComponent {
  render() {
    const resultsRoute = new SearchRoute({ query: JSON.stringify(this.props.query) });

    return (
      <Relay.RootContainer
        Component={SearchResultsContainer}
        route={resultsRoute}
        renderFetched={data => <SearchResultsContainer {...this.props} {...data} />}
        renderLoading={() => <MediasLoading />}
      />
    );
  }
}

export default SearchResults;
