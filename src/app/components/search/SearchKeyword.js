import React from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames/bind';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import SearchKeywordMenu from './SearchKeywordConfig/SearchKeywordMenu';
import SearchField from './SearchField';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import Loader from '../cds/loading/Loader';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import UploadFileMutation from '../../relay/mutations/UploadFileMutation';
import AttachFileIcon from '../../icons/attach_file.svg';
import searchStyles from './search.module.css';

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
    this.props.setStateQuery(cleanQuery);
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
    this.props.setStateQuery(cleanQuery);
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
    this.props.setStateQuery(newQuery);
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
    this.props.setStateQuery(newQuery);
  }

  /*
  check that the sort parameter is the default, if it is, set the parameter to "clear"
  to identify that no other sort filter is applied and the search query should be reset
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
    this.props.setStateQuery(cleanQuery);
    this.props.handleSubmit(null, cleanQuery);
  };

  subscribe() {
    const { clientSessionId, pusher, team } = this.props;
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
  }

  unsubscribe() {
    const { pusher, team } = this.props;
    pusher.unsubscribe(team.pusher_channel, 'tagtext_updated', 'SearchKeyword');
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

  triggerInputFile = () => this.fileInput.click()

  render() {
    const { showExpand, team } = this.props;
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
      <>
        <PageTitle prefix={title} team={this.props.team} />
        <form
          autoComplete="off"
          className={cx('search__form', searchStyles['search-form'])}
          id="search-form"
          onSubmit={this.props.handleSubmit}
        >
          <SearchField
            handleClear={this.props.query?.file_type ? this.handleImageDismiss : this.handleClickClear}
            inputBaseProps={{
              onBlur: this.handleInputChange,
              disabled: this.state?.imgData?.data?.length > 0,
            }}
            isActive={this.keywordIsActive() || this.keywordConfigIsActive()}
            searchQuery={this.props.query}
            searchText={this.props.query?.keyword || ''}
            setParentSearchText={this.setSearchText}
            showExpand={showExpand}
          />
          { showExpand || !this.props.hideAdvanced ?
            <div className={searchStyles['search-form-config']}>
              { showExpand &&
                <>
                  <input
                    accept="image/*,video/*,audio/*"
                    id="media-upload"
                    ref={(el) => { this.fileInput = el; }}
                    style={{ display: 'none' }}
                    type="file"
                    onChange={this.handleUpload}
                  />
                  <Tooltip arrow title={<FormattedMessage defaultMessage="Search with file" description="This is a label on a button that the user presses in order to choose a video, image, or audio file that will be searched for. The file itself is not uploaded, so 'upload' would be the wrong verb to use here. This action opens a file picker prompt." id="search.file" />}>
                    <span>
                      <ButtonMain
                        iconCenter={this.state.isSaving ? <Loader size="icon" variant="icon" /> : <AttachFileIcon />}
                        size="small"
                        theme="lightBeige"
                        variant="text"
                        onClick={this.triggerInputFile}
                      />
                    </span>
                  </Tooltip>
                </>
              }
              { !this.props.hideAdvanced &&
                <SearchKeywordMenu
                  query={this.props.query}
                  onChange={this.handleKeywordConfigChange}
                />
              }
            </div> : null
          }
        </form>
      </>
    );
  }
}

SearchKeyword.defaultProps = {
  showExpand: false,
};

SearchKeyword.propTypes = {
  cleanupQuery: PropTypes.func.isRequired,
  clientSessionId: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pusher: pusherShape.isRequired,
  query: PropTypes.object.isRequired,
  setStateQuery: PropTypes.func.isRequired,
  showExpand: PropTypes.bool,
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
};


// eslint-disable-next-line import/no-unused-modules
export { SearchKeyword as SearchKeywordTest };

export default createFragmentContainer((withPusher(SearchKeyword)), graphql`
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
