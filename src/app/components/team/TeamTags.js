import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import IconClose from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import deepEqual from 'deep-equal';
import styled from 'styled-components';
import TagTextCount from './TagTextCount';
import ConfirmDialog from '../layout/ConfirmDialog';
import SortSelector from '../layout/SortSelector';
import FilterPopup from '../layout/FilterPopup';
import TeamRoute from '../../relay/TeamRoute';
import { units, ContentColumn, black32, AlignOpposite } from '../../styles/js/shared';
import Can, { can } from '../Can';
import Message from '../Message';
import { withPusher, pusherShape } from '../../pusher';
import CreateTagTextMutation from '../../relay/mutations/CreateTagTextMutation';
import UpdateTagTextMutation from '../../relay/mutations/UpdateTagTextMutation';
import DeleteTagTextMutation from '../../relay/mutations/DeleteTagTextMutation';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';

const StyledContentColumn = styled(ContentColumn)`
  .highlight {
    background-color: #FFF !important;
    -webkit-transition: background-color 1000ms linear !important;
    -ms-transition: background-color 1000ms linear !important;
    transition: background-color 1000ms linear !important;
  }
`;

const messages = defineMessages({
  menuTooltip: {
    id: 'teamTags.menuTooltip',
    defaultMessage: 'Tag actions',
  },
});

class TeamTagsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      sort: 'az',
      search: '',
      newTag: '',
      highlight: null,
      message: null,
      editing: null,
      dialogOpen: false,
      tagToBeDeleted: null,
      deleting: false,
      countTotal: 0,
      countHidden: 0,
      tag_texts: [],
    };
  }

  componentDidMount() {
    this.subscribe();
    this.filter();
  }

  componentDidUpdate() {
    this.filter();
    this.highlight();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  highlight() {
    if (this.state.highlight) {
      const element = document.getElementById(`tag__text-${this.state.highlight}`);
      if (element) {
        element.scrollIntoView(false);
        element.style.backgroundColor = black32;
        setTimeout(() => {
          element.className = 'highlight';
          this.setState({ highlight: null });
        }, 100);
      }
    }
  }

  filter() {
    const tag_texts = [];
    let countTotal = 0;
    let countHidden = 0;
    this.props.team.tag_texts.edges.forEach((node) => {
      const tag = node.node;
      countTotal += 1;
      if (tag.text.toLowerCase().includes(this.state.search.toLowerCase())) {
        tag_texts.push(tag);
      } else {
        countHidden += 1;
      }
    });
    if (
      !deepEqual(tag_texts, this.state.tag_texts) ||
      countTotal !== this.state.countTotal ||
      countHidden !== this.state.countHidden
    ) {
      this.setState({
        tag_texts,
        countTotal,
        countHidden,
      });
    }
  }

  handleOpenDialog() {
    this.setState({
      dialogOpen: true,
    });
  }

  handleCloseDialog() {
    this.setState({ dialogOpen: false });
  }

  handleUpdate(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      const text = document.getElementById('tag__edit').value;
      const tag = this.state.editing;
      this.setState({ search: '', editing: null });
      if (text.length > 0 && tag.text !== text) {
        const onSuccess = () => {
          this.setState({
            message: null,
            highlight: text,
          });
        };
        const onFailure = () => {
          this.setState({
            editing: tag,
            message: <FormattedMessage
              id="teamTags.failUpdate"
              defaultMessage="Sorry, an error occurred while updating the tag. Please try again and contact {supportEmail} if the condition persists."
              values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
            />,
          });
        };

        Relay.Store.commitUpdate(
          new UpdateTagTextMutation({
            team: this.props.team,
            tagText: {
              id: tag.id,
              text,
            },
          }),
          { onSuccess, onFailure },
        );
      }
    }
  }

  handleCancelUpdate() {
    this.setState({ editing: null });
  }

  handleChange(e) {
    this.setState({ sort: e.target.value });
  }

  handleKeyUp() {
    const newTag = document.getElementById('tag__new').value;
    this.setState({ newTag });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleAddTag();
    }
  }

  handleOpenMenu = (e, menuOpenForTag) => {
    this.setState({ anchorEl: e.currentTarget, menuOpenForTag });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null, menuOpenForTag: null });
  };

  handleEdit(tag) {
    this.setState({ editing: tag, anchorEl: null, menuOpenForTag: null });
  }

  handleDelete(tag) {
    this.setState({
      dialogOpen: true,
      tagToBeDeleted: tag,
      message: null,
      anchorEl: null,
      menuOpenForTag: null,
    });
  }

  handleDestroy() {
    this.setState({ deleting: true });

    const onSuccess = () => {
      this.setState({
        message: null,
        tagToBeDeleted: null,
        dialogOpen: false,
        deleting: false,
      });
    };
    const onFailure = () => {
      this.setState({
        deleting: false,
        message: <FormattedMessage
          id="teamTags.failDelete"
          defaultMessage="Sorry, an error occurred while updating the tag. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />,
      });
    };

    const tag = this.state.tagToBeDeleted;
    Relay.Store.commitUpdate(
      new DeleteTagTextMutation({
        teamId: this.props.team.id,
        id: tag.id,
      }),
      { onSuccess, onFailure },
    );
  }

  handleMove(tag) {
    const onSuccess = () => {
      this.setState({
        message: null,
        highlight: tag.text,
      });
    };
    const onFailure = () => {
      this.setState({
        message: <FormattedMessage
          id="teamTags.failMove"
          defaultMessage="Sorry, an error occurred while updating the tag. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />,
      });
    };

    Relay.Store.commitUpdate(
      new UpdateTagTextMutation({
        team: this.props.team,
        tagText: {
          id: tag.id,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  handleSearchChange = (e) => {
    this.setState({ search: e.target.value });
  };

  handleAddTag() {
    const text = document.getElementById('tag__new').value;
    const onSuccess = () => {
      document.getElementById('tag__new').value = '';
      this.setState({
        newTag: '',
        search: '',
        message: null,
        highlight: text,
      });
    };
    const onFailure = () => {
      this.setState({
        message: <FormattedMessage
          id="teamTags.fail"
          defaultMessage="Sorry, an error occurred while updating the tag. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />,
      });
    };

    Relay.Store.commitUpdate(
      new CreateTagTextMutation({
        team: this.props.team,
        text,
      }),
      { onSuccess, onFailure },
    );
  }

  tagsList(list) {
    return (
      <Box p={2}>
        <List
          style={{
            maxHeight: 400,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          { list.map((tag) => {
            const menu = can(tag.permissions, 'update TagText') ? (
              <div>
                <IconButton
                  className="tag__actions"
                  style={{ padding: 0 }}
                  tooltip={this.props.intl.formatMessage(messages.menuTooltip)}
                  onClick={e => this.handleOpenMenu(e, tag)}
                >
                  <MoreHoriz />
                </IconButton>
                <Menu
                  anchorEl={this.state.anchorEl}
                  open={Boolean(this.state.anchorEl && (this.state.menuOpenForTag === tag))}
                  onClose={this.handleCloseMenu}
                  style={{ margin: '0 12px' }}
                >
                  <MenuItem
                    className="tag__edit"
                    onClick={this.handleEdit.bind(this, tag)}
                  >
                    <ListItemText
                      primary={<FormattedMessage id="teamTags.editTag" defaultMessage="Edit tag" />}
                    />
                  </MenuItem>
                  <MenuItem
                    className="tag__delete"
                    onClick={this.handleDelete.bind(this, tag)}
                  >
                    <ListItemText
                      primary={<FormattedMessage id="teamTags.deleteTag" defaultMessage="Delete tag" />}
                    />
                  </MenuItem>
                </Menu>
              </div>
            ) : null;

            if (this.state.editing && this.state.editing.dbid === tag.dbid) {
              return (
                <Box py={0}>
                  <ListItem key={tag.dbid}>
                    <Box py={0}>
                      <TextField
                        id="tag__edit"
                        autoFocus
                        onKeyPress={this.handleUpdate.bind(this)}
                        defaultValue={tag.text}
                      />
                    </Box>
                    {' '}
                    <Tooltip title={this.props.intl.formatMessage(globalStrings.cancel)}>
                      <IconClose
                        style={{ cursor: 'pointer', verticalAlign: 'sub' }}
                        onClick={this.handleCancelUpdate.bind(this)}
                      />
                    </Tooltip>
                  </ListItem>
                </Box>
              );
            }

            return (
              <Box py={2} px={0}>
                <ListItem
                  key={tag.dbid}
                  id={`tag__text-${tag.text}`}
                >
                  <ListItemText
                    primary={tag.text}
                    secondary={
                      <FormattedMessage
                        id="teamTags.itemsCount"
                        defaultMessage="{count, plural, =0 {no items} one {1 item} other {# items}}"
                        values={{ count: tag.tags_count }}
                      />
                    }
                  />
                  <ListItemSecondaryAction>
                    {menu}
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            );
          })}
        </List>
      </Box>
    );
  }

  handleBlur() {
    const search = document.getElementById('tag__search').value;
    this.setState({ search });
  }

  subscribe() {
    const { pusher, clientSessionId, team } = this.props;
    pusher.subscribe(team.pusher_channel).bind('tagtext_updated', 'TeamTagsComponent', (data, run) => {
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
    pusher.unsubscribe(team.pusher_channel, 'tagtext_updated', 'TeamTagsComponent');
  }

  render() {
    const sortFunctions = {
      az: (a, b) => (a.text.localeCompare(b.text)),
      za: (a, b) => (a.text.localeCompare(b.text) * -1),
      of: (a, b) => (a.created_at > b.created_at ? 1 : -1),
      nf: (a, b) => (a.created_at < b.created_at ? 1 : -1),
      mu: (a, b) => (a.tags_count < b.tags_count ? 1 : -1),
      lu: (a, b) => (a.tags_count > b.tags_count ? 1 : -1),
    };
    const tag_texts = this.state.tag_texts.slice(0).sort(sortFunctions[this.state.sort]);

    const filterLabel = this.state.countHidden > 0 ? (
      <FormattedMessage
        id="teamTags.counter"
        defaultMessage="{total, plural, =0 {No tags} one {1 tag ({hidden} hidden by filters)} other {# tags ({hidden} hidden by filters)}}"
        values={{
          total: this.state.countTotal,
          hidden: this.state.countHidden,
        }}
      />
    ) : (
      <FormattedMessage
        id="teamTags.counterNoHidden"
        defaultMessage="{total, plural, =0 {No tags} one {1 tag} other {# tags}}"
        values={{
          total: this.state.countTotal,
        }}
      />
    );

    return (
      <StyledContentColumn>
        <Message message={this.state.message} />
        <AlignOpposite>
          <FilterPopup
            search={this.state.search}
            onSearchChange={this.handleSearchChange}
            label={filterLabel}
            tooltip={<FormattedMessage id="teamTags.tooltip" defaultMessage="Filter and sort list" />}
          >
            <Box mt={2}>
              <SortSelector
                value={this.state.sort}
                onChange={this.handleChange.bind(this)}
                fullWidth
              />
            </Box>
          </FilterPopup>
        </AlignOpposite>
        <Box mt={2}>
          <Card>
            <Box p={0}>
              <CardContent>
                { tag_texts.length === 0 ?
                  <Box pb={5} display='flex' alignItems='center'>
                    <p>
                      <FormattedMessage
                        id="teamTags.noTags"
                        defaultMessage="No tags"
                      />
                    </p>
                  </Box>
                  : null }
                {this.tagsList(tag_texts)}
                <Can permissions={this.props.team.permissions} permission="create TagText">
                  <Box p={2}>
                    <Box width="50%">
                      <TextField
                        id="tag__new"
                        onKeyUp={this.handleKeyUp.bind(this)}
                        onKeyPress={this.handleKeyPress.bind(this)}
                        label={<FormattedMessage id="teamTags.new" defaultMessage="New tag" />}
                      />
                    </Box>
                    <p>
                      <Button
                        onClick={this.handleAddTag.bind(this)}
                        disabled={this.state.newTag.length === 0}
                        color="primary"
                      >
                        <FormattedMessage id="teamTags.addTag" defaultMessage="Add tag" />
                      </Button>
                    </p>
                  </Box>
                </Can>
              </CardContent>
            </Box>
          </Card>
        </Box>

        <ConfirmDialog
          open={this.state.dialogOpen}
          title={
            <FormattedMessage
              id="teamTags.confirmDeleteTitle"
              defaultMessage="Are you sure you want to delete this tag?"
            />
          }
          checkBoxLabel={<TagTextCount tag={this.state.tagToBeDeleted} />}
          disabled={this.state.deleting || !this.state.tagToBeDeleted}
          handleClose={this.handleCloseDialog.bind(this)}
          handleConfirm={this.handleDestroy.bind(this)}
        />
      </StyledContentColumn>
    );
  }
}

TeamTagsComponent.propTypes = {
  relay: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  pusher: pusherShape.isRequired,
};

const TeamTagsContainer = Relay.createContainer(withPusher(injectIntl(TeamTagsComponent)), {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        slug
        permissions
        pusher_channel
        tag_texts(first: 10000) {
          edges {
            node {
              id
              dbid
              text
              tags_count
              permissions
              created_at
            }
          }
        }
      }
    `,
  },
});

const TeamTags = (props) => {
  const route = new TeamRoute({ teamSlug: props.team.slug });
  const params = { propTeam: props.team };
  return (
    <Relay.RootContainer
      Component={TeamTagsContainer}
      route={route}
      renderFetched={data => <TeamTagsContainer {...data} {...params} />}
    />
  );
};

export default TeamTags;
