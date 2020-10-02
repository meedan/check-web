import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
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
import { getCurrentProjectId } from '../../helpers';

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

  closeMenu = () => {
    this.setState({
      anchorEl: null,
      value: '',
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

    const selected = media.tags.edges
      .map(t => t.node.tag_text)
      .concat(this.state.tagsToAdd)
      .filter(text => !this.state.tagsToRemove.includes(text));

    return (
      <div>
        <IconButton
          className="tag-menu__icon"
          tooltip={<FormattedMessage id="tagMenu.tooltip" defaultMessage="Edit tags" />}
          onClick={this.handleOpenMenu}
        >
          <TagOutline />
        </IconButton>
        <Popover
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.closeMenu}
        >
          <div>
            <TagInput media={media} onChange={this.handleChange} />
            <TagPicker
              media={media}
              value={this.state.value}
              selectedTags={selected}
              onClick={this.handleTagClick}
            />
            <StyledActions>
              <Button
                style={{ marginLeft: 'auto' }}
                className="tag-menu__done"
                onClick={this.handleSubmit}
                color="primary"
              >
                <FormattedMessage id="tagMenu.done" defaultMessage="Done" />
              </Button>
            </StyledActions>
          </div>
        </Popover>
      </div>
    );
  }
}

TagMenuComponent.contextTypes = {
  store: PropTypes.object,
};

TagMenuComponent.propTypes = {
  media: PropTypes.object.isRequired,
  relay: PropTypes.object.isRequired,
};

const TagMenuContainer = Relay.createContainer(TagMenuComponent, {
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
