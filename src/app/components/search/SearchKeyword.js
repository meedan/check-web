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
import PermMediaOutlinedIcon from '@material-ui/icons/PermMediaOutlined';
import SearchKeywordMenu from './SearchKeywordConfig/SearchKeywordMenu';
import SearchField from './SearchField';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import UploadFileMutation from '../../relay/mutations/UploadFileMutation';

const styles = {
  input: {
    display: 'none',
  },
  button: {
    fontWeight: 400,
    fontSize: 12,
    paddingTop: 0,
    paddingBottom: 0,
  },
};

class SearchKeyword extends React.Component {
  constructor(props) {
    super(props);

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
    cleanQuery.file_url = data.searchUpload?.file_url;
    let file_type;
    if (this.state.imgData.type.match(/^video\//)) {
      file_type = 'video';
    } else if (this.state.imgData.type.match(/^image\//)) {
      file_type = 'image';
    } else if (this.state.imgData.type.match(/^audio\//)) {
      file_type = 'audio';
    }
    cleanQuery.file_type = file_type;
    cleanQuery.file_name = this.state.imgData.name;
    delete cleanQuery.keyword;
    this.setState({
      isSaving: false,
    });
    this.props.setQuery(cleanQuery);
    this.props.handleSubmit();
  };

  onUploadFailure = () => {
    this.setState({ isSaving: false });
  };

  setSearchText = (text) => {
    const cleanQuery = this.props.cleanupQuery(this.props.query);
    cleanQuery.keyword = text;
    delete cleanQuery.file_type;
    delete cleanQuery.file_handle;
    delete cleanQuery.file_url;
    delete cleanQuery.file_name;
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
    this.props.handleSubmit(null, newQuery);
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
    const newKeyword = ev?.target?.value || textOverride;
    if (newKeyword) { // empty string => remove property from query
      newQuery.keyword = newKeyword;
      newQuery.sort = 'score';
    }
    this.props.setQuery(newQuery);
  }

  /*
  check that the sort parameter is the default, if it is, set the parameter to "clear"
  to identify that no other sort filter is applied and the search query should be reseted
  */
  handleClickClear = () => {
    const newQuery = { ...this.props.query };
    delete newQuery.keyword;
    if (newQuery.sort === 'score') {
      newQuery.sort = 'clear';
    }
    this.props.handleSubmit(null, newQuery);
  };

  handleImageDismiss = () => {
    const cleanQuery = this.props.cleanupQuery(this.props.query);
    delete cleanQuery.file_type;
    delete cleanQuery.file_handle;
    delete cleanQuery.file_url;
    delete cleanQuery.file_name;
    this.setState({
      imgData: {
        data: '',
        name: '',
      },
    });
    this.props.setQuery(cleanQuery);
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
    const { team, classes, showExpand } = this.props;
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
        <form
          id="search-form"
          className="search__form"
          onSubmit={this.props.handleSubmit}
          autoComplete="off"
        >
          <Box width="450px">
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <SearchField
                  isActive={this.keywordIsActive() || this.keywordConfigIsActive()}
                  showExpand={showExpand}
                  setParentSearchText={this.setSearchText}
                  searchText={this.props.query?.keyword || ''}
                  searchQuery={this.props.query}
                  inputBaseProps={{
                    onBlur: this.handleInputChange,
                    disabled: this.state?.imgData?.data?.length > 0,
                  }}
                  handleClear={this.props.query?.file_type ? this.handleImageDismiss : this.handleClickClear}
                />
              </Grid>
              <Grid item container xs={12}>
                <Box display="flex" justifyContent="flex-end" marginLeft="auto">
                  { showExpand ? (
                    <div>
                      <label htmlFor="media-upload">
                        <input
                          className={classes.input}
                          id="media-upload"
                          type="file"
                          accept="image/*,video/*,audio/*"
                          onChange={this.handleUpload}
                        />
                        <Button
                          startIcon={this.state.isSaving ? <CircularProgress size={24} /> : <PermMediaOutlinedIcon />}
                          component="span"
                          className={classes.button}
                        >
                          <FormattedMessage
                            id="search.file"
                            defaultMessage="Search with file"
                            description="This is a label on a button that the user presses in order to choose a video, image, or audio file that will be searched for. The file itself is not uploaded, so 'upload' would be the wrong verb to use here. This action opens a file picker prompt."
                          />
                        </Button>
                      </label>
                    </div>
                  ) : null }
                  { this.props.hideAdvanced ?
                    null :
                    <SearchKeywordMenu
                      onChange={this.handleKeywordConfigChange}
                      query={this.props.query}
                    />
                  }
                </Box>
              </Grid>
            </Grid>
          </Box>
        </form>
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
