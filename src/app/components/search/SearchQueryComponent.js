import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import IconButton from '@material-ui/core/IconButton';
import FilterListIcon from '@material-ui/icons/FilterList';
import ClearIcon from '@material-ui/icons/Clear';
import isEqual from 'lodash.isequal';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { searchQueryFromUrl, urlFromSearchQuery } from './Search';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import { bemClass } from '../../helpers';
import { teamStatuses } from '../../customHelpers';
import {
  white,
  black87,
  black38,
  black16,
  black05,
  black54,
  boxShadow,
  Row,
  ContentColumn,
  units,
  caption,
  borderWidthSmall,
  transitionSpeedFast,
  transitionSpeedDefault,
  mediaQuery,
  ellipsisStyles,
  columnWidthMedium,
} from '../../styles/js/shared';

const statusKey = config.appName === 'bridge' ? 'translation_status' : 'verification_status';

export const StyledSearchInput = styled.input`
  background-repeat: no-repeat;
  background-color: ${white};
  background-image: url('/images/search.svg');
  background-position: ${props => (props.isRtl ? `calc(100% - ${units(2)})` : units(2))} center;
  border: ${borderWidthSmall} solid ${black16};
  border-radius: ${units(0.5)};
  height: ${units(6)};
  margin-top: ${units(1)};
  outline: none;
  transition: box-shadow ${transitionSpeedFast};
  width: 100%;
  font-size: 16px;

  &:focus {
    box-shadow: ${boxShadow(2)};
    transition: box-shadow ${transitionSpeedDefault};
  }
  padding-${props => (props.isRtl ? 'right' : 'left')}: ${units(6)};
`;

const StyledPopper = styled(Popper)`
  width: 100%;
  max-width: ${columnWidthMedium};
  padding: 0 ${units(1)};

  table {
    width: 100%;
    display: block;
  }

  td {
    padding: ${units(1)};
  }

  a {
    font: ${caption};
    padding-${props => (props.isRtl ? 'right' : 'left')}: ${units(1)};
  }

  button {
    color: ${black54};
    float: ${props => (props.isRtl ? 'left' : 'right')};
  }
`;

const StyledSearchFiltersSection = styled.section`
  padding: ${units(1)};
  margin-top: ${units(1)};

  ${mediaQuery.handheld`
    padding: ${units(2)} 0;
  `}

  .search__filters-loader {
    margin: ${units(4)} 0;
    text-align: center;
  }
`;

const StyledFilterRow = styled(Row)`
  max-height: ${units(20)};
  overflow-y: auto;
  flex-wrap: wrap;

  h4 {
    color: ${black87};
    margin: 0;
    min-width: ${units(6)};
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
  }

  ${mediaQuery.tablet`
    justify-content: flex-end;
    h4 {
      margin-${props => (props.isRtl ? 'left' : 'right')}: auto;
    }
  `};

  ${mediaQuery.handheld`
    // Make them a single row that scrolls horizontally.
    // DEPRECATED: upgrade this component to use dropdowns per spec.
    // CGB 2017-10-10
    padding: 0;
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: auto;
    &::-webkit-scrollbar { // Hide scrollbar
      width: 0px;
      height: 0px;
      background: transparent;
    }

    h4 {
      padding: ${units(0.5)};
      text-align: ${props => (props.isRtl ? 'right' : 'left')};
      margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
    }
  `}
`;

const StyledFilterButton = styled.div`
  margin: 0 ${units(0.5)} ${units(0.5)}};
  background-color: ${black05};
  border-radius: ${units(3)};
  padding: 0 ${units(1.5)};
  font: ${caption};
  line-height: ${units(3.5)};
  transition: all ${transitionSpeedDefault};
  white-space: nowrap;
  max-width: ${units(20)};
  ${ellipsisStyles}
  &:hover {
    cursor: pointer;
    background-color: ${black16};
  }
  ${props =>
    props.active
      ? `color: ${black87}!important; font-weight: 700;`
      : `color: ${black38};
  `}
`;

const messages = defineMessages({
  title: {
    id: 'search.title',
    defaultMessage: 'Search',
  },
  searchInputHint: {
    id: 'search.inputHint',
    defaultMessage: 'Search',
  },
});

class SearchQueryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: {},
      popper: {
        open: false,
        allowed: true,
        anchorEl: null,
      },
      dialogOpen: false,
    };
  }

  componentWillMount() {
    const context = this.getContext();
    if (context.getContextStore().project && /\/search/.test(window.location.pathname)) {
      context.setContextStore({ project: null });
    }

    const query = searchQueryFromUrl();
    this.setState({ query });
  }

  componentWillReceiveProps() {
    const query = searchQueryFromUrl();
    if (!isEqual(this.state.query, query)) {
      this.setState({ query });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const query = searchQueryFromUrl();
    return !isEqual(this.state, nextState) ||
           !isEqual(this.state.query, query);
  }

  componentDidUpdate(prevProps, prevState) {
    const query = searchQueryFromUrl();
    if (isEqual(this.state.query, query)) return;

    const viewMode = this.props.view ? `/${this.props.view}` : '';

    const url = urlFromSearchQuery(
      prevState.query,
      this.props.project
        ? `/${this.props.team.slug}/project/${this.props.project.dbid}${viewMode}`
        : `/${this.props.team.slug}/search`,
    );

    this.getContext().getContextStore().history.push(url);
  }

  getContext() {
    return new CheckContext(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const keywordInput = document.getElementById('search-input').value;

    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      state.query.keyword = keywordInput;
      return { query: state.query };
    });
  }

  statusIsSelected(statusCode, state = this.state) {
    const selectedStatuses = state.query[statusKey] || [];
    return selectedStatuses.length && selectedStatuses.includes(statusCode);
  }

  projectIsSelected(projectId, state = this.state) {
    const selectedProjects = state.query.projects || [];
    return selectedProjects.length && selectedProjects.includes(projectId);
  }

  tagIsSelected(tag, state = this.state) {
    const selectedTags = state.query.tags || [];
    return selectedTags.length && selectedTags.includes(tag);
  }

  sortIsSelected(sortParam, state = this.state) {
    if (['ASC', 'DESC'].includes(sortParam)) {
      return (
        state.query.sort_type === sortParam || (!state.query.sort_type && sortParam === 'DESC')
      );
    }
    return state.query.sort === sortParam || (!state.query.sort && sortParam === 'recent_added');
  }

  sortLabel(sortParam, state = this.state) {
    const { sort } = state.query || {};
    if (!sort || sort === 'recent_added' || sort === 'recent_activity') {
      return sortParam === 'ASC' ?
        (<FormattedMessage id="search.sortByOldest" defaultMessage="Oldest first" />) :
        (<FormattedMessage id="search.sortByNewest" defaultMessage="Newest first" />);
    }
    const schema = this.props.team.dynamic_search_fields_json_schema;
    const labels = schema.properties.sort.properties[sort].items.enum;
    return sortParam === 'ASC' ? labels[0] : labels[1];
  }

  showIsSelected(show, state = this.state) {
    const selected = state.query.show || ['medias'];
    return selected.includes(show);
  }

  dynamicIsSelected(field, value, state = this.state) {
    const dynamic = state.query.dynamic || {};
    const selected = dynamic[field] || [];
    return selected.includes(value);
  }

  handleStatusClick(statusCode) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      const statusIsSelected = this.statusIsSelected(statusCode, state);
      const selectedStatuses = state.query[statusKey] || []; // TODO Avoid ambiguous reference

      if (statusIsSelected) {
        selectedStatuses.splice(selectedStatuses.indexOf(statusCode), 1); // remove from array
        if (!selectedStatuses.length) delete state.query[statusKey];
      } else {
        state.query[statusKey] = selectedStatuses.concat(statusCode);
      }

      return { query: state.query };
    });
  }

  handleProjectClick(projectId) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      const projectIsSelected = this.projectIsSelected(projectId, state);
      const selectedProjects = state.query.projects || [];

      if (projectIsSelected) {
        selectedProjects.splice(selectedProjects.indexOf(projectId), 1);
        if (!selectedProjects.length) delete state.query.projects;
      } else {
        state.query.projects = selectedProjects.concat(projectId);
      }
      return { query: state.query };
    });
  }

  handleTagClick(tag) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      const tagIsSelected = this.tagIsSelected(tag, state);
      const selectedTags = state.query.tags || [];

      if (tagIsSelected) {
        selectedTags.splice(selectedTags.indexOf(tag), 1); // remove from array
        if (!selectedTags.length) delete state.query.tags;
      } else {
        state.query.tags = selectedTags.concat(tag);
      }
      return { query: state.query };
    });
  }

  handleSortClick(sortParam) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      if (['ASC', 'DESC'].includes(sortParam)) {
        state.query.sort_type = sortParam;
        return { query: state.query };
      }
      state.query.sort = sortParam;
      return { query: state.query };
    });
  }

  handleShowClick(show) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      if (!state.query.show) {
        state.query.show = ['medias'];
      }
      const i = state.query.show.indexOf(show);
      if (i === -1) {
        state.query.show.push(show);
      } else {
        state.query.show.splice(i, 1);
      }
      return { query: state.query };
    });
  }

  handleDynamicClick(field, value) {
    this.setState((prevState) => {
      const state = Object.assign({}, prevState);
      if (!state.query.dynamic) {
        state.query.dynamic = {};
      }
      if (!state.query.dynamic[field]) {
        state.query.dynamic[field] = [];
      }
      const i = state.query.dynamic[field].indexOf(value);
      if (i === -1) {
        state.query.dynamic[field].push(value);
      } else {
        state.query.dynamic[field].splice(i, 1);
      }
      return { query: state.query };
    });
  }

  handleDialogOpen = () => {
    this.setState({ dialogOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  // Create title out of query parameters
  title(statuses, projects) {
    const { query } = this.state;
    return (
      // Merge/flatten the array constructed below
      // http://stackoverflow.com/a/10865042/209184
      [].concat // eslint-disable-line prefer-spread
        .apply(
          [],
          [
            query.projects
              ? query.projects.map((p) => {
                const project = projects.find(pr => pr.node.dbid === p);
                return project ? project.node.title : '';
              })
              : [],
            query[statusKey]
              ? query[statusKey].map((s) => {
                const status = statuses.find(so => so.id === s);
                return status ? status.label : '';
              })
              : [],
            query.keyword,
            query.tags,
          // Remove empty entries
          // http://stackoverflow.com/a/19888749/209184
          ].filter(Boolean),
        )
        .join(' ')
        .trim() || this.props.intl.formatMessage(messages.title)
    );
  }

  showField(field) {
    return this.props.fields ? this.props.fields.indexOf(field) > -1 : true;
  }

  handleInputChange() {
    // Open the search help when
    // - user has typed something
    // - user has not explicitly closed the help
    // - user has reset the keywords
    const input = document.getElementById('search-input');
    this.setState({
      popper: {
        open: input.value.length > 0 && this.state.popper.allowed,
        anchorEl: input,
        allowed: this.state.popper.allowed || !input.value.length,
      },
    });
  }

  handlePopperClick() {
    this.setState({ popper: { open: false, allowed: false } });
  }

  render() {
    const { team } = this.props;
    const { statuses } = teamStatuses(team);
    let projects = [];
    if (team.projects) {
      projects = team.projects.edges.sortp((a, b) =>
        a.node.title.localeCompare(b.node.title));
    }
    const suggestedTags = team.get_suggested_tags
      ? team.get_suggested_tags.split(',').map(tag => tag.trim())
      : [];
    const title =
      this.props.title ||
      (this.props.project ? this.props.project.title : this.title(statuses, projects));

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    return (
      <div>
        <IconButton onClick={this.handleDialogOpen}>
          <FilterListIcon />
        </IconButton>
        <PageTitle prefix={title} skipTeam={false} team={this.props.team}>
          <Dialog open={this.state.dialogOpen} onClose={this.handleDialogClose}>
            <DialogContent>
              <ContentColumn>
                {this.showField('keyword') ?
                  <form
                    id="search-form"
                    className="search__form"
                    onSubmit={this.handleSubmit.bind(this)}
                    autoComplete="off"
                  >
                    <StyledSearchInput
                      placeholder={this.props.intl.formatMessage(messages.searchInputHint)}
                      name="search-input"
                      id="search-input"
                      defaultValue={this.state.query.keyword || ''}
                      isRtl={isRtl}
                      onChange={this.handleInputChange.bind(this)}
                      autofocus
                    />
                    <StyledPopper
                      id="search-help"
                      isRtl={isRtl}
                      open={this.state.popper.open}
                      anchorEl={this.state.popper.anchorEl}
                    >
                      <Paper>
                        <IconButton style={{ fontSize: '20px' }} onClick={this.handlePopperClick.bind(this)}>
                          <ClearIcon />
                        </IconButton>
                        <FormattedHTMLMessage
                          id="search.help"
                          defaultMessage='
                            <table>
                              <tbody>
                                <tr><td>+</td><td>Tree + Leaf</td><td>Items with both Tree AND Leaf</td></tr>
                                <tr><td>|</td><td>Tree | Leaf</td><td>Items with either Tree OR Leaf</td></tr>
                                <tr><td>()</td><td>Tree + (Leaf | Branch)</td><td>Items with Tree AND Leaf OR items with Tree AND Branch</td></tr>
                              </tbody>
                            </table>
                            <div>
                              <a href="https://medium.com/meedan-user-guides/search-on-check-25c752bd8cc1" target="_blank" >
                                Learn more about search techniques
                              </a>
                            </div>'
                        />
                      </Paper>
                    </StyledPopper>
                  </form>
                  : null}

                <StyledSearchFiltersSection>
                  {this.showField('status') ?
                    <StyledFilterRow isRtl={isRtl}>
                      <h4><FormattedMessage id="search.statusHeading" defaultMessage="Status" /></h4>
                      {statuses.map(status => (
                        <StyledFilterButton
                          active={this.statusIsSelected(status.id)}
                          key={status.id}
                          title={status.description}
                          onClick={this.handleStatusClick.bind(this, status.id)}
                          className={bemClass(
                            'media-tags__suggestion',
                            this.statusIsSelected(status.id),
                            '--selected',
                          )}
                        >
                          {status.label}
                        </StyledFilterButton>))}
                    </StyledFilterRow>
                    : null}

                  {this.showField('project') ?
                    <StyledFilterRow>
                      <h4>
                        <FormattedMessage id="search.projectHeading" defaultMessage="Project" />
                      </h4>
                      {projects.map(project => (
                        <StyledFilterButton
                          active={this.projectIsSelected(project.node.dbid)}
                          key={project.node.dbid}
                          onClick={this.handleProjectClick.bind(this, project.node.dbid)}
                          className={bemClass(
                            'search-filter__project-chip',
                            this.projectIsSelected(project.node.dbid),
                            '--selected',
                          )}
                        >
                          {project.node.title}
                        </StyledFilterButton>))}
                    </StyledFilterRow>
                    : null}

                  {this.showField('tags') && suggestedTags.length ?
                    <StyledFilterRow>
                      <h4>
                        <FormattedMessage id="status.categoriesHeading" defaultMessage="Categories" />
                      </h4>
                      {suggestedTags.map(tag => (
                        <StyledFilterButton
                          active={this.tagIsSelected(tag)}
                          key={tag}
                          title={null}
                          onClick={this.handleTagClick.bind(this, tag)}
                          className={bemClass(
                            'media-tags__suggestion',
                            this.tagIsSelected(tag),
                            '--selected',
                          )}
                        >
                          {tag}
                        </StyledFilterButton>))}
                    </StyledFilterRow>
                    : null}

                  {this.showField('sort') ?
                    <StyledFilterRow className="search-query__sort-actions media-tags__suggestions-list">
                      <h4><FormattedMessage id="search.sort" defaultMessage="Sort" /></h4>

                      <StyledFilterButton
                        active={this.sortIsSelected('recent_added')}
                        onClick={this.handleSortClick.bind(this, 'recent_added')}
                        className={bemClass(
                          'media-tags__suggestion',
                          this.sortIsSelected('recent_added'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.sortByCreated" defaultMessage="Created" />
                      </StyledFilterButton>
                      <StyledFilterButton
                        active={this.sortIsSelected('recent_activity')}
                        onClick={this.handleSortClick.bind(this, 'recent_activity')}
                        className={bemClass(
                          'media-tags__suggestion',
                          this.sortIsSelected('recent_activity'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage
                          id="search.sortByRecentActivity"
                          defaultMessage="Recent activity"
                        />
                      </StyledFilterButton>

                      {Object
                        .keys(team.dynamic_search_fields_json_schema.properties.sort.properties)
                        .map((id) => {
                          const { sort } = team.dynamic_search_fields_json_schema.properties;
                          const label = sort.properties[id].title;
                          return (
                            <StyledFilterButton
                              key={`dynamic-sort-${id}`}
                              active={this.sortIsSelected(id)}
                              onClick={this.handleSortClick.bind(this, id)}
                              className={bemClass(
                                'media-tags__suggestion',
                                this.sortIsSelected(id),
                                '--selected',
                              )}
                            >
                              <span>{label}</span>
                            </StyledFilterButton>
                          );
                        })
                      }

                      <StyledFilterButton
                        style={isRtl ? { marginRight: units(3) } : { marginLeft: units(3) }}
                        active={this.sortIsSelected('DESC')}
                        onClick={this.handleSortClick.bind(this, 'DESC')}
                        className={bemClass(
                          'media-tags__suggestion',
                          this.sortIsSelected('DESC'),
                          '--selected',
                        )}
                      >
                        {this.sortLabel('DESC')}
                      </StyledFilterButton>
                      <StyledFilterButton
                        active={this.sortIsSelected('ASC')}
                        onClick={this.handleSortClick.bind(this, 'ASC')}
                        className={bemClass(
                          'media-tags__suggestion',
                          this.sortIsSelected('ASC'),
                          '--selected',
                        )}
                      >
                        {this.sortLabel('ASC')}
                      </StyledFilterButton>
                    </StyledFilterRow>
                    : null}

                  {this.showField('show') ?
                    <StyledFilterRow className="search-query__sort-actions media-tags__suggestions-list">
                      <h4><FormattedMessage id="search.show" defaultMessage="Show" /></h4>
                      <StyledFilterButton
                        active={this.showIsSelected('medias')}
                        onClick={this.handleShowClick.bind(this, 'medias')}
                        className={bemClass(
                          'media-tags__suggestion',
                          this.showIsSelected('medias'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.showMedia" defaultMessage="Media" />
                      </StyledFilterButton>
                      <StyledFilterButton
                        active={this.showIsSelected('sources')}
                        onClick={this.handleShowClick.bind(this, 'sources')}
                        className={bemClass(
                          'media-tags__suggestion',
                          this.showIsSelected('sources'),
                          '--selected',
                        )}
                      >
                        <FormattedMessage id="search.showSources" defaultMessage="Sources" />
                      </StyledFilterButton>
                    </StyledFilterRow>
                    : null}

                  {this.showField('dynamic') ?
                    (Object.keys(team.dynamic_search_fields_json_schema.properties).map((key) => {
                      if (key === 'sort') {
                        return null;
                      }

                      const annotationType = team.dynamic_search_fields_json_schema.properties[key];

                      const fields = [];

                      if (annotationType.type === 'array') {
                        annotationType.items.enum.forEach((value, i) => {
                          const label = annotationType.items.enumNames[i];
                          const option = (
                            <StyledFilterButton
                              key={`dynamic-field-${key}-option-${value}`}
                              active={this.dynamicIsSelected(key, value)}
                              onClick={this.handleDynamicClick.bind(this, key, value)}
                              className={bemClass(
                                'media-tags__suggestion',
                                this.dynamicIsSelected(key, value),
                                '--selected',
                              )}
                            >
                              <span>{label}</span>
                            </StyledFilterButton>
                          );
                          fields.push(option);
                        });
                      }

                      return (
                        <StyledFilterRow key={`dynamic-field-${key}`} className="search-query__dynamic media-tags__suggestions-list">
                          <h4>{annotationType.title}</h4>
                          {fields}
                        </StyledFilterRow>
                      );
                    }))
                    : null}
                </StyledSearchFiltersSection>

                {this.props.addons}
              </ContentColumn>
            </DialogContent>
          </Dialog>
        </PageTitle>
      </div>
    );
  }
}

SearchQueryComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

SearchQueryComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(SearchQueryComponent);
