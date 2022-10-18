import React from 'react';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
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
import SearchKeywordMenu from './SearchKeywordConfig/SearchKeywordMenu';
import SearchField from './SearchField';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import {
  Row,
  black16,
  checkBlue,
} from '../../styles/js/shared';
import UploadFileMutation from '../../relay/mutations/UploadFileMutation';

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
    backgroundColor: checkBlue,
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
    this.initialQuery = {
      keyword: props.query.keyword,
    };

    this.state = {
      isSaving: false,
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
    const cleanQuery = this.props.cleanupQuery(this.props.query);
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
    this.setState({
      isSaving: false,
    });
    this.props.setQuery(cleanQuery);
  };

  onUploadFailure = () => {
    this.setState({ isSaving: false });
  };

  setSearchText = (text) => {
    const cleanQuery = this.props.cleanupQuery(this.props.query);
    cleanQuery.keyword = text;
    delete cleanQuery.file_type;
    delete cleanQuery.file_handle;
    this.props.setQuery(cleanQuery);
  }

  keywordIsActive = () => {
    const { query } = this.props;
    return query.keyword && query.keyword.trim() !== '';
  };

  keywordConfigIsActive = () => {
    const { query } = this.props;
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
    const newQuery = { ...this.props.query, ...value };
    if (Object.keys(value.keyword_fields).length === 0) {
      delete newQuery.keyword_fields;
    }
    this.props.setQuery(newQuery);
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
            this.initialQuery?.keyword,
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
    const { keyword, ...newQuery } = this.props.query;
    const newKeyword = ev.target.value || textOverride;
    if (newKeyword) { // empty string => remove property from query
      newQuery.keyword = newKeyword;
      newQuery.sort = 'score';
    }
    this.props.setQuery(newQuery);
  }

  handleClickClear = () => {
    const newQuery = { ...this.props.query };
    delete newQuery.keyword;
    this.props.setQuery(newQuery);
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
      const cleanQuery = this.props.cleanupQuery(this.props.query);
      delete cleanQuery.file_type;
      delete cleanQuery.file_handle;
      this.setState({
        imgData: {
          data: '',
          name: '',
        },
      });
      this.props.setQuery(cleanQuery);
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
            onSubmit={this.props.handleSubmit}
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
                    searchText={this.props.query?.keyword || ''}
                    inputBaseProps={{
                      onBlur: this.handleInputChange,
                      ref: this.searchInput,
                      disabled: this.state?.imgData?.data?.length > 0,
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
                          query={this.props.query}
                          anchorParent={() => this.searchInput.current}
                        />
                      </InputAdornment>
                    }
                  />
                </Box>
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
              { this.props.showExpand && (this.state?.imgData?.data?.length > 0 || this.state.isSaving) ? (
                <Grid item>
                  { this.state.isSaving ? (
                    <CircularProgress size={36} />
                  ) : <ImagePreview />
                  }
                </Grid>) : null
              }
              { this.props.showExpand && this.state?.imgData?.data?.length === 0 ? (
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
                    onClick={this.props.handleSubmit}
                  >
                    <FormattedMessage
                      id="search"
                      defaultMessage="Search"
                      description="This is a label on a button that the user presses in order to execute a search query."
                    />
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
  setQuery: PropTypes.func.isRequired,
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
  cleanupQuery: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};


// eslint-disable-next-line import/no-unused-modules
export { SearchKeyword as SearchKeywordTest };

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
