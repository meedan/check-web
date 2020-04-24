import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import styled from 'styled-components';
import TagInput from './TagInput';
import TagPicker from './TagPicker';
import { can } from '../Can';
import { units } from '../../styles/js/shared';
import TagOutline from '../../../assets/images/tag/tag-outline';
import MediaRoute from '../../relay/MediaRoute';
import RelayContainer from '../../relay/RelayContainer';
import CheckContext from '../../CheckContext';
import { createTag } from '../../relay/mutations/CreateTagMutation';
import { deleteTag } from '../../relay/mutations/DeleteTagMutation';

const StyledActions = styled.div`
  padding: ${units(2)};
  align-items: flex-end;
  flex-direction: row;
  display: flex;
`;

class TagMenuComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
      value: '',
      tagsToAdd: [],
      tagsToRemove: [],
    };
  }

  callback = () => {};

  handleChange = (value) => {
    this.setState({ value });
  };

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
    this.props.relay.forceFetch();
  };

  handleCloseMenu = () => {
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
    this.setState({
      anchorEl: null,
      value: '',
      tagsToAdd: [],
      tagsToRemove: [],
    });
  };

  handleTagToAdd(tag) {
    const tagsToAdd = this.state.tagsToAdd.slice();
    tagsToAdd.push(tag);
    const tagsToRemove = this.state.tagsToRemove.slice();
    if (tagsToRemove.indexOf(tag) > -1) {
      tagsToRemove.splice(tagsToRemove.indexOf(tag), 1);
    }
    this.setState({ tagsToRemove, tagsToAdd });
  }

  handleTagToRemove(tag) {
    const tagsToRemove = this.state.tagsToRemove.slice();
    tagsToRemove.push(tag);
    const tagsToAdd = this.state.tagsToAdd.slice();
    if (tagsToAdd.indexOf(tag) > -1) {
      tagsToAdd.splice(tagsToAdd.indexOf(tag), 1);
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
      this.callback,
      this.callback,
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
      this.callback,
      this.callback,
    );
  };

  render() {
    const { media } = this.props;

    if (!can(media.permissions, 'update ProjectMedia') || media.archived) {
      return null;
    }

    return (
      <div>
        <IconButton
          className="tag-menu__icon"
          tooltip={<FormattedMessage id="tagMenu.tooltip" defaultMessage="Edit tags" />}
          onClick={this.handleOpenMenu}
        >
          <TagOutline />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
        >
          <div>
            <TagInput media={media} onChange={this.handleChange} />
            <TagPicker
              value={this.state.value}
              media={media}
              tags={media.tags.edges}
              onAddTag={this.handleTagToAdd.bind(this)}
              onRemoveTag={this.handleTagToRemove.bind(this)}
            />
            <StyledActions>
              <Button
                style={{ marginLeft: 'auto' }}
                className="tag-menu__done"
                onClick={this.handleCloseMenu}
                color="primary"
              >
                <FormattedMessage id="tagMenu.done" defaultMessage="Done" />
              </Button>
            </StyledActions>
          </div>
        </Menu>
      </div>
    );
  }
}

TagMenuComponent.contextTypes = {
  store: PropTypes.object,
};

const TagMenuContainer = Relay.createContainer(TagMenuComponent, {
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
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
          name
          used_tags
          get_suggested_tags
        }
        permissions
      }
    `,
  },
});

// eslint-disable-next-line react/no-multi-comp
class TagMenu extends React.Component {
  // eslint-disable-next-line class-methods-use-this
  shouldComponentUpdate(nextProps, nextState) {
    if (isEqual(this.props.tags, nextProps.tags) && isEqual(this.state, nextState)) {
      return false;
    }
    return true;
  }

  render() {
    const ids = `${this.props.media.dbid},${this.props.media.project_id}`;
    const route = new MediaRoute({ ids });

    return (
      <RelayContainer
        Component={TagMenuContainer}
        route={route}
        renderFetched={data => <TagMenuContainer {...this.props} {...data} />}
        forceFetch
      />
    );
  }
}

export default injectIntl(TagMenu);
