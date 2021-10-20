import React from 'react';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import InputAdornment from '@material-ui/core/InputAdornment';
import {
  Cancel as CancelIcon,
  FiberManualRecord as MaskIcon,
  VolumeUp as AudioIcon,
  Clear as ClearIcon,
  Movie as MovieIcon,
  Image as ImageIcon,
} from '@material-ui/icons';
import deepEqual from 'deep-equal';
import styled from 'styled-components';
import SearchKeywordMenu from './SearchKeywordConfig/SearchKeywordMenu';
import SearchField from './SearchField';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import {
  black54,
  Row,
  units,
  caption,
  black16,
  brandHighlight,
} from '../../styles/js/shared';
import UploadFileMutation from '../../relay/mutations/UploadFileMutation';

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
  searchButton: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
  image: {
    position: 'relative',
    overflowY: 'hidden',
    height: '40px',
    maxWidth: '50px',
    '& img': {
      maxWidth: '50px',
    },
    '& video': {
      maxWidth: '50px',
    },
    '& #icon': {
      position: 'relative',
      marginTop: theme.spacing(1.5),
      marginLeft: theme.spacing(2),
    },
    '& svg,button': {
      position: 'absolute',
      left: '0px',
      top: '0px',
    },
  },
});

class SearchKeyword extends React.Component {
  constructor(props) {
    super(props);

    this.searchInput = React.createRef();

    this.state = {
      isSaving: false,
      query: props.query, // CODE SMELL! Caller must use `key=` to reset state on prop change
      isPopperClosed: false, // user sets this once per page load
      imgData: {
        data: '',
        name: '',
      },
    };
  }

  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onUploadSuccess = (data) => {
    const cleanQuery = this.cleanup(this.state.query);
    cleanQuery.file_handle = data.searchUpload?.file_handle;
    let file_type;
    if (this.state.imgData.type.match(/^video\//)) {
      file_type = 'video';
    } else if (this.state.imgData.type.match(/^image\//)) {
      file_type = 'image';
    } else if (this.state.imgData.type.match(/^audio\//)) {
      file_type = 'audio';
    }
    cleanQuery.file_type = file_type;
    delete cleanQuery.keyword;
    // eslint-disable-next-line
    console.log('~~~transactionsuccess', cleanQuery, data);
    this.setState({
      isSaving: false,
      query: cleanQuery,
    });
    this.props.onChange(cleanQuery);
  };

  onUploadFailure = (transaction) => {
    // eslint-disable-next-line
    console.log('~~~transactionfail', transaction);
    this.setState({ isSaving: false });
  };

  setSearchText = (text) => {
    const cleanQuery = this.cleanup(this.state.query);
    cleanQuery.keyword = text;
    this.setState({ query: cleanQuery });
  }

  cleanup = (query) => {
    const cleanQuery = { ...query };
    if (query.team_tasks) {
      cleanQuery.team_tasks = query.team_tasks.filter(tt => (
        tt.id && tt.response && tt.task_type
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

  handleInputChange = (ev, textOverride) => {
    const { keyword, ...newQuery } = this.state.query;
    const newKeyword = ev.target.value || textOverride;
    if (newKeyword) { // empty string => remove property from query
      newQuery.keyword = newKeyword;
    }
    this.setState({ query: newQuery });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
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

  handleUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    this.setState({ isSaving: true });

    reader.onloadend = () => {
      this.setState({
        imgData: {
          data: reader.result,
          name: file.name,
          file,
          type: file.type,
        },
      });
      this.setSearchText('');

      Relay.Store.commitUpdate(
        new UploadFileMutation({
          file,
        }),
        { onSuccess: this.onUploadSuccess, onFailure: this.onUploadFailure },
      );
    };
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

    const handleImageDismiss = () => {
      this.setState({
        imgData: {
          data: '',
          name: '',
        },
      });
    };

    /* eslint-disable jsx-a11y/media-has-caption */
    const Thumbnail = () => {
      let output;
      if (this.state.imgData.type.match(/^video\//)) {
        output = <MovieIcon id="icon" fontSize="medium" htmlColor="black" />;
      } else if (this.state.imgData.type.match(/^image\//)) {
        output = <ImageIcon id="icon" fontSize="medium" htmlColor="black" />;
      } else if (this.state.imgData.type.match(/^audio\//)) {
        output = <AudioIcon id="icon" fontSize="medium" htmlColor="black" />;
      }
      return output;
    };
    /* eslint-enable jsx-a11y/media-has-caption */

    const ImagePreview = () => (
      <Box className={classes.image}>
        <Thumbnail />
        <MaskIcon fontSize="small" htmlColor="white" />
        <IconButton onClick={handleImageDismiss}>
          <CancelIcon fontSize="small" htmlColor="black" />
        </IconButton>
      </Box>
    );

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
            <Grid
              container
              direction="row"
              justify="flex-end"
              alignItems="center"
              className={classes.endAdornmentContainer}
              spacing={2}
            >
              <Grid item>
                <Box width="450px">
                  <SearchField
                    isActive={this.keywordIsActive() || this.keywordConfigIsActive()}
                    showExpand={this.props.showExpand}
                    setParentSearchText={this.setSearchText}
                    searchText={this.state.query.keyword || ''}
                    inputBaseProps={{
                      defaultValue: this.state.query.keyword || '',
                      onChange: this.handleInputChange,
                      ref: this.searchInput,
                      disabled: this.state.imgData.data.length > 0,
                    }}
                    endAdornment={
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
                    }
                  />
                </Box>
                <StyledPopper
                  id="search-help"
                  open={
                    // Open the search help when
                    // - user has typed something
                    // - user has not explicitly closed the help
                    // - search does not have modal expansion widget
                    this.state.query.keyword !== this.props.query.keyword &&
                    !this.state.isPopperClosed &&
                    !this.props.showExpand
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
              </Grid>
              { this.props.showExpand ? (
                <Grid item>
                  <Typography>
                    &nbsp;
                    <FormattedMessage
                      id="search.or"
                      defaultMessage="OR"
                      description="This is a label that appears between two mutually exclusive search options, indicating that you may select one option 'OR' the other."
                    />
                  </Typography>
                </Grid>) : null
              }
              { this.props.showExpand && (this.state.imgData.data.length > 0 || this.state.isSaving) ? (
                <Grid item>
                  { this.state.isSaving ? (
                    <CircularProgress size={36} />
                  ) : <ImagePreview />
                  }
                </Grid>) : null
              }
              { this.props.showExpand && this.state.imgData.data.length === 0 ? (
                <Grid item>
                  <label htmlFor="media-upload">
                    <input
                      className={classes.input}
                      id="media-upload"
                      type="file"
                      accept="image/*,video/*,audio/*"
                      onChange={this.handleUpload}
                    />
                    <Button
                      variant="outlined"
                      className={classes.searchButton}
                      component="span"
                    >
                      <FormattedMessage
                        id="search.file"
                        defaultMessage="Search with file"
                        description="This is a label on a button that the user presses in order to choose a video, image, or audio file that will be searched for. The file itself is not uploaded, so 'upload' would be the wrong verb to use here. This action opens a file picker prompt."
                      />
                    </Button>
                  </label>
                </Grid>) : null
              }
              { this.props.showExpand ? (
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.handleSubmit}
                  >
                    Search
                  </Button>
                </Grid>) : null
              }
            </Grid>
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

SearchKeyword.defaultProps = {
  showExpand: false,
};
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
  showExpand: PropTypes.bool,
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
