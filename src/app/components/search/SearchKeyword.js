import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import deepEqual from 'deep-equal';
import styled from 'styled-components';
import SearchKeywordMenu from './SearchKeywordConfig/SearchKeywordMenu';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import {
  black16,
  black54,
  brandHighlight,
  Row,
  units,
  caption,
  borderWidthLarge,
} from '../../styles/js/shared';

const StyledPopper = styled(Popper)`
  width: 80%;
  padding: 0 ${units(1)};
  z-index: 10000;

  table {
    width: 100%;
    display: block;
  }

  td {
    padding: ${units(1)};
  }

  a {
    font: ${caption};
    padding-${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: ${units(1)};
  }

  button {
    color: ${black54};
    float: ${props => (props.theme.dir === 'rtl' ? 'left' : 'right')};
  }
`;

const styles = theme => ({
  inputInactive: {
    borderRadius: theme.spacing(0.5),
    border: `${borderWidthLarge} solid ${black16}`,
  },
  inputActive: {
    borderRadius: theme.spacing(0.5),
    border: `${borderWidthLarge} solid ${brandHighlight}`,
  },
  startAdornmentRoot: {
    display: 'flex',
    justifyContent: 'center',
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  endAdornmentRoot: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  endAdornmentInactive: {
    backgroundColor: black16,
  },
  endAdornmentActive: {
    color: 'white',
    backgroundColor: brandHighlight,
  },
});

class SearchKeyword extends React.Component {
  constructor(props) {
    super(props);

    this.searchInput = React.createRef();

    this.state = {
      query: props.query, // CODE SMELL! Caller must use `key=` to reset state on prop change
      isPopperClosed: false, // user sets this once per page load
    };
  }

  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  cleanup = (query) => {
    const cleanQuery = { ...query };
    if (query.team_tasks) {
      cleanQuery.team_tasks = query.team_tasks.filter(tt => (
        tt.id && tt.response && tt.response_type
      ));
      if (!cleanQuery.team_tasks.length) {
        delete cleanQuery.team_tasks;
      }
    }
    if (query.range) {
      const datesObj =
        query.range.created_at ||
        query.range.updated_at ||
        query.range.published_at ||
        query.range.last_seen || {};
      if (!datesObj.start_time && !datesObj.end_time) {
        delete cleanQuery.range;
      }
    }
    return cleanQuery;
  }

  handleApplyFilters() {
    const cleanQuery = this.cleanup(this.state.query);
    if (!deepEqual(cleanQuery, this.props.query)) {
      this.props.onChange(cleanQuery);
    } else {
      this.setState({ query: cleanQuery });
    }
  }

  keywordIsActive = () => {
    const { query } = this.props;
    return query.keyword && query.keyword.trim() !== '';
  };

  keywordConfigIsActive = () => {
    const { query } = this.state;
    return query.keyword_fields;
  }

  filterIsActive = () => {
    const { query } = this.props;
    const filterFields = [
      'range',
      'verification_status',
      'projects',
      'tags',
      'type',
      'dynamic',
      'users',
      'team_tasks',
    ];
    return filterFields.some(key => !!query[key]);
  }

  handleKeywordConfigChange = (value) => {
    const newQuery = { ...this.state.query, ...value };
    if (Object.keys(value.keyword_fields).length === 0) {
      delete newQuery.keyword_fields;
    }
    const callback = this.state.query.keyword ? this.handleApplyFilters : null;
    this.setState({ query: newQuery }, callback);
  }

  // Create title out of query parameters
  title(statuses, projects) {
    const { query } = this.props;
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
            query.verification_status
              ? query.verification_status.map((s) => {
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
        .trim()
    );
  }

  handleInputChange = (ev) => {
    const { keyword, ...newQuery } = this.state.query;
    const newKeyword = ev.target.value;
    if (newKeyword) { // empty string => remove property from query
      newQuery.keyword = newKeyword;
    }
    this.setState({ query: newQuery });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    this.handleApplyFilters();
  }

  handleBlur = () => {
    this.handleApplyFilters();
  }

  handlePopperClick = (ev) => {
    ev.preventDefault();
    this.setState({ isPopperClosed: true });
  }

  handleClickClear = () => {
    const newQuery = { ...this.state.query };
    delete newQuery.keyword;
    this.setState({ query: newQuery }, this.handleApplyFilters);
  };

  subscribe() {
    const { pusher, clientSessionId, team } = this.props;
    pusher.subscribe(team.pusher_channel).bind('tagtext_updated', 'SearchKeyword', (data, run) => {
      if (clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `team-${team.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });

    pusher.subscribe(team.pusher_channel).bind('project_updated', 'SearchKeyword', (data, run) => {
      if (clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `team-${team.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, team } = this.props;
    pusher.unsubscribe(team.pusher_channel, 'tagtext_updated', 'SearchKeyword');
    pusher.unsubscribe(team.pusher_channel, 'project_updated', 'SearchKeyword');
  }

  render() {
    const { team, classes } = this.props;
    const { statuses } = team.verification_statuses;
    let projects = [];
    if (team.projects) {
      projects = team.projects.edges.slice().sort((a, b) =>
        a.node.title.localeCompare(b.node.title));
    }

    const title = (this.filterIsActive() || this.keywordIsActive())
      ? this.title(statuses, projects)
      : (this.props.title || (this.props.project ? this.props.project.title : null));

    return (
      <div>
        <PageTitle prefix={title} team={this.props.team} />
        <Row>
          <form
            id="search-form"
            className="search__form"
            onSubmit={this.handleSubmit}
            autoComplete="off"
          >
            <Box width="450px">
              <FormattedMessage id="search.inputHint" defaultMessage="Search" description="Placeholder for search keywords input">
                { placeholder => (
                  <InputBase
                    classes={{
                      root: (
                        this.keywordIsActive() || this.keywordConfigIsActive() ?
                          classes.inputActive :
                          classes.inputInactive
                      ),
                    }}
                    placeholder={placeholder}
                    name="search-input"
                    id="search-input"
                    defaultValue={this.state.query.keyword || ''}
                    onBlur={this.handleBlur}
                    onChange={this.handleInputChange}
                    ref={this.searchInput}
                    InputProps={{
                      disableUnderline: true,
                      startAdornment: (
                        <InputAdornment
                          classes={{
                            root: classes.startAdornmentRoot,
                          }}
                        >
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment
                          classes={{
                            root: classes.endAdornmentRoot,
                            filled: (
                              this.keywordConfigIsActive() ?
                                classes.endAdornmentActive :
                                classes.endAdornmentInactive
                            ),
                          }}
                          variant="filled"
                        >
                          <SearchKeywordMenu
                            teamSlug={this.props.team.slug}
                            onChange={this.handleKeywordConfigChange}
                            query={this.state.query}
                            anchorParent={() => this.searchInput.current}
                          />
                        </InputAdornment>
                      ),
                    }}
                    autoFocus
                    fullWidth
                  />
                )}
              </FormattedMessage>
            </Box>
            <StyledPopper
              id="search-help"
              open={
                // Open the search help when
                // - user has typed something
                // - user has not explicitly closed the help
                this.state.query.keyword !== this.props.query.keyword &&
                !this.state.isPopperClosed
              }
              anchorEl={() => this.searchInput.current}
            >
              <Paper>
                <IconButton onClick={this.handlePopperClick}>
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
                  description="Instructions for usage of logical operators on search input"
                />
              </Paper>
            </StyledPopper>
          </form>

          { this.keywordIsActive() ? (
            <Tooltip title={<FormattedMessage id="searchKeyword.clear" defaultMessage="Clear keyword search" description="Tooltip for button to remove any applied keyword search" />}>
              <IconButton id="search-keyword__clear-button" onClick={this.handleClickClear}>
                <ClearIcon color="primary" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Row>
      </div>
    );
  }
}

SearchKeyword.propTypes = {
  classes: PropTypes.object.isRequired,
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired, // onChange({ ... /* query */ }) => undefined
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    pusher_channel: PropTypes.string.isRequired,
    verification_statuses: PropTypes.shape({
      statuses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }).isRequired), // undefined during optimistic update
    }).isRequired,
    projects: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        dbid: PropTypes.number,
        title: PropTypes.string,
      })),
    }),
  }).isRequired,
};

export default createFragmentContainer(withStyles(styles)(withPusher(SearchKeyword)), graphql`
  fragment SearchKeyword_team on Team {
    id
    dbid
    verification_statuses
    pusher_channel
    name
    slug
    projects(first: 10000) {
      edges {
        node {
          title
          dbid
          id
        }
      }
    }
  }
`);
