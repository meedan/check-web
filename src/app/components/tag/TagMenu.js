import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined';
import { MultiSelector } from '@meedan/check-ui';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import MediaRoute from '../../relay/MediaRoute';
import RelayContainer from '../../relay/RelayContainer';
import CheckContext from '../../CheckContext';
import { createTag } from '../../relay/mutations/CreateTagMutation';
import { deleteTag } from '../../relay/mutations/DeleteTagMutation';
import { getErrorMessage } from '../../helpers';
import CheckArchivedFlags from '../../CheckArchivedFlags';

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
      searchValue: null,
    };
  }

  noop = () => {}; // FIXME: avoid this pattern and simply omit onSuccess

  fail = (transaction) => {
    const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
    this.props.setFlashMessage(message, 'error');
  };

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
    this.props.relay.forceFetch();
  };

  handleCloseMenu = () => this.setState({ anchorEl: null });

  handleChange = searchValue => this.setState({ searchValue });

  handleSelect = (value) => {
    const tags = this.props.media.tags.edges.map(tag => tag.node.tag_text);

    tags.forEach((text) => {
      if (!value.includes(text)) this.handleRemoveTag(text);
    });
    value.forEach((val) => {
      if (!tags.includes(val)) this.handleCreateTag(val);
    });
    this.handleCloseMenu();
  };

  handleAddNew = (value) => {
    this.handleCreateTag(value);
    this.handleCloseMenu();
  };

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
    const { searchValue } = this.state;

    if (!can(media.permissions, 'update ProjectMedia') || media.archived > CheckArchivedFlags.NONE) {
      return null;
    }

    const selected = media.tags.edges.map(t => t.node.tag_text);
    const options = media.team.tag_texts.edges.map(tt => ({ label: tt.node.text, value: tt.node.text }));

    const actionButton = searchValue && !options.includes(searchValue) ? (
      <Button
        id="tag-menu__create-button"
        color="primary"
        onClick={() => this.handleAddNew(searchValue)}
      >
        <FormattedMessage id="tagMenu.create" defaultMessage="+ Create this tag" />
      </Button>
    ) : null;

    return (
      <React.Fragment>
        <StyledIconButton
          className="tag-menu__icon"
          tooltip={<FormattedMessage id="tagMenu.tooltip" defaultMessage="Edit tags" />}
          onClick={this.handleOpenMenu}
        >
          <LocalOfferOutlinedIcon />
        </StyledIconButton>
        <Popover
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
        >
          <FormattedMessage id="multiSelector.search" defaultMessage="Search…">
            {placeholder => (
              <MultiSelector
                actionButton={actionButton}
                allowSearch
                inputPlaceholder={placeholder}
                selected={selected}
                options={options}
                onDismiss={this.handleCloseMenu}
                onSearchChange={this.handleChange}
                onSubmit={this.handleSelect}
                notFoundLabel={
                  <FormattedMessage
                    id="tagMenu.notFound"
                    defaultMessage="No tags found"
                  />
                }
                submitLabel={
                  <FormattedMessage
                    id="tagMenu.submit"
                    defaultMessage="Tag"
                    description="Verb, infinitive form. Button to commit action of tagging an item"
                  />
                }
              />
            )}
          </FormattedMessage>
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
    const projectId = this.props.media.project_id;
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
