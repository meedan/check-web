import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import TagInput from './TagInput';
import TagPicker from './TagPicker';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import TagOutline from '../../../assets/images/tag/tag-outline';
import MediaRoute from '../../relay/MediaRoute';
import RelayContainer from '../../relay/RelayContainer';
import CheckContext from '../../CheckContext';
import { createTag } from '../../relay/mutations/CreateTagMutation';
import { deleteTag } from '../../relay/mutations/DeleteTagMutation';
import { getCurrentProjectId, getErrorMessage } from '../../helpers';

const StyledIconButton = withStyles(theme => ({
  root: {
    padding: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
    },
  },
}))(IconButton);

class TagMenuComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
      searchValue: '',
      tagsToAdd: [],
      tagsToRemove: [],
    };
  }

  noop = () => {}; // FIXME: avoid this pattern and simply omit onSuccess

  fail = (transaction) => {
    const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
    this.props.setFlashMessage(message);
  };

  handleChange = (searchValue) => {
    this.setState({ searchValue });
  };

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
    this.props.relay.forceFetch();
  };

  closeMenu = () => {
    this.setState({
      anchorEl: null,
      searchValue: '',
      tagsToAdd: [],
      tagsToRemove: [],
    });
  };

  handleSubmit = () => {
    const tags = this.props.media.tags.edges.map(tag => tag.node.tag_text);
    this.state.tagsToAdd.forEach((tag) => {
      if (tags.indexOf(tag) === -1) {
        this.handleCreateTag(tag);
      }
    });
    this.state.tagsToRemove.forEach((tag) => {
      if (tags.indexOf(tag) > -1) {
        this.handleRemoveTag(tag);
      }
    });
    this.closeMenu();
  };

  handleTagClick = (e, inputChecked) => {
    if (inputChecked) {
      this.handleTagToAdd(e.target.id);
    } else {
      this.handleTagToRemove(e.target.id);
    }
  }

  handleTagToAdd(tag) {
    const tagsToAdd = this.state.tagsToAdd.slice();
    const tagsToRemove = this.state.tagsToRemove.slice();

    if (tagsToRemove.indexOf(tag) > -1) {
      tagsToRemove.splice(tagsToRemove.indexOf(tag), 1);
    } else {
      tagsToAdd.push(tag);
    }

    this.setState({ tagsToRemove, tagsToAdd });
  }

  handleTagToRemove(tag) {
    const tagsToRemove = this.state.tagsToRemove.slice();
    const tagsToAdd = this.state.tagsToAdd.slice();

    if (tagsToAdd.indexOf(tag) > -1) {
      tagsToAdd.splice(tagsToAdd.indexOf(tag), 1);
    } else {
      tagsToRemove.push(tag);
    }

    this.setState({ tagsToRemove, tagsToAdd });
  }

  handleCreateTag(value) {
    const { media } = this.props;

    const context = new CheckContext(this).getContextStore();

    createTag(
      {
        media,
        value,
        annotator: context.currentUser,
      },
      this.noop,
      this.fail,
    );
  }

  handleRemoveTag = (value) => {
    const { media } = this.props;

    const removedTag = media.tags.edges.find(tag => tag.node.tag_text === value);

    if (!removedTag) {
      return;
    }

    deleteTag(
      {
        media,
        tagId: removedTag.node.id,
      },
      this.noop,
      this.fail,
    );
  };

  render() {
    const { media } = this.props;

    if (!can(media.permissions, 'update ProjectMedia') || media.archived) {
      return null;
    }

    const selected = media.tags.edges
      .map(t => t.node.tag_text)
      .concat(this.state.tagsToAdd)
      .filter(text => !this.state.tagsToRemove.includes(text));

    return (
      <React.Fragment>
        <StyledIconButton
          className="tag-menu__icon"
          tooltip={<FormattedMessage id="tagMenu.tooltip" defaultMessage="Edit tags" />}
          onClick={this.handleOpenMenu}
        >
          <TagOutline />
        </StyledIconButton>
        <Popover
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.closeMenu}
        >
          <div>
            <TagInput media={media} onChange={this.handleChange} />
            <TagPicker
              team={media.team}
              searchValue={this.state.searchValue}
              selectedTags={selected}
              onClick={this.handleTagClick}
            />
            <Box p={2} display="flex" flexDirection="row" justifyContent="flex-end">
              <Button
                className="tag-menu__done"
                onClick={this.handleSubmit}
                color="primary"
              >
                <FormattedMessage id="tagMenu.done" defaultMessage="Done" />
              </Button>
            </Box>
          </div>
        </Popover>
      </React.Fragment>
    );
  }
}

TagMenuComponent.contextTypes = {
  store: PropTypes.object,
};

TagMenuComponent.propTypes = {
  media: PropTypes.object.isRequired,
  relay: PropTypes.object.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

const TagMenuContainer = Relay.createContainer(withSetFlashMessage(TagMenuComponent), {
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        permissions
        tags(first: 10000) {
          edges {
            node {
              tag,
              tag_text,
              id
            }
          }
        }
        team {
          id,
          tag_texts(first: 10000) {
            edges {
              node {
                text
              }
            }
          }
        }
      }
    `,
  },
});

// eslint-disable-next-line react/no-multi-comp
class TagMenu extends React.PureComponent {
  render() {
    const projectId = getCurrentProjectId(this.props.media.project_ids);
    const ids = `${this.props.media.dbid},${projectId}`;
    const route = new MediaRoute({ ids });

    return (
      <RelayContainer
        Component={TagMenuContainer}
        route={route}
        renderFetched={data => <TagMenuContainer {...this.props} {...data} />}
      />
    );
  }
}

export default injectIntl(TagMenu);
