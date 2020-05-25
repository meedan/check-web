import React, { Component } from 'react';
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
import CardHeaderOutside from '../layout/CardHeaderOutside';
import ConfirmDialog from '../layout/ConfirmDialog';
import SortSelector from '../layout/SortSelector';
import FilterPopup from '../layout/FilterPopup';
import TeamRoute from '../../relay/TeamRoute';
import { units, ContentColumn, black32 } from '../../styles/js/shared';
import Can, { can } from '../Can';
import Message from '../Message';
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
    this.props.relay.forceFetch();
    this.filter();
  }

  componentDidUpdate() {
    this.filter();
    this.highlight();
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
      this.setState({ search: '' });
      const text = document.getElementById('tag__edit').value;
      const tag = this.state.editing;
      if (text.length > 0 && tag.text !== text) {
        const onSuccess = () => {
          this.setState({
            message: null,
            editing: null,
            highlight: text,
          });
        };
        const onFailure = () => {
          this.setState({
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
          teamwide: true,
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

  tagsList(list, showMove) {
    return (
      <List
        style={{
          maxHeight: 400,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: units(2),
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
                open={this.state.anchorEl && (this.state.menuOpenForTag === tag)}
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
                { showMove ? (
                  <MenuItem
                    className="tag__move"
                    onClick={this.handleMove.bind(this, tag)}
                  >
                    <ListItemText
                      primary={<FormattedMessage id="teamTags.moveTag" defaultMessage="Move to default tags" />}
                    />
                  </MenuItem>) : null }
              </Menu>
            </div>
          ) : null;

          if (this.state.editing && this.state.editing.dbid === tag.dbid) {
            return (
              <ListItem key={tag.dbid} style={{ paddingTop: 0, paddingBottom: 0 }}>
                <TextField
                  style={{ paddingTop: 0, paddingBottom: 0 }}
                  id="tag__edit"
                  autoFocus
                  onKeyPress={this.handleUpdate.bind(this)}
                  defaultValue={tag.text}
                />
                {' '}
                <Tooltip title={this.props.intl.formatMessage(globalStrings.cancel)}>
                  <IconClose
                    style={{ cursor: 'pointer', verticalAlign: 'sub' }}
                    onClick={this.handleCancelUpdate.bind(this)}
                  />
                </Tooltip>
              </ListItem>
            );
          }

          return (
            <ListItem
              style={{ padding: `${units(2)} 0` }}
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
          );
        })}
      </List>
    );
  }

  handleBlur() {
    const search = document.getElementById('tag__search').value;
    this.setState({ search });
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
        <CardHeaderOutside
          title={<FormattedMessage id="teamTags.tags" defaultMessage="Tags" />}
          direction={this.props.direction}
          actions={
            <FilterPopup
              search={this.state.search}
              onSearchChange={this.handleSearchChange}
              label={filterLabel}
              tooltip={<FormattedMessage id="teamTags.tooltip" defaultMessage="Filter and sort list" />}
            >
              <div style={{ marginTop: units(2) }}>
                <SortSelector
                  value={this.state.sort}
                  onChange={this.handleChange.bind(this)}
                  fullWidth
                />
              </div>
            </FilterPopup>
          }
        />
        <Card style={{ marginTop: units(2) }}>
          <CardContent style={{ padding: 0 }}>
            { tag_texts.length === 0 ?
              <p style={{ paddingBottom: units(5), textAlign: 'center' }}>
                <FormattedMessage
                  id="teamTags.noTags"
                  defaultMessage="No tags"
                />
              </p>
              : null }
            {this.tagsList(tag_texts, false)}
            <Can permissions={this.props.team.permissions} permission="create TagText">
              <div style={{ padding: units(2) }}>
                <TextField
                  id="tag__new"
                  onKeyUp={this.handleKeyUp.bind(this)}
                  onKeyPress={this.handleKeyPress.bind(this)}
                  label={<FormattedMessage id="teamTags.new" defaultMessage="New tag" />}
                  style={{ width: '50%' }}
                />
                <p>
                  <Button
                    onClick={this.handleAddTag.bind(this)}
                    disabled={this.state.newTag.length === 0}
                    primary={this.state.newTag.length > 0}
                  >
                    <FormattedMessage id="teamTags.addTag" defaultMessage="Add tag" />
                  </Button>
                </p>
              </div>
            </Can>
          </CardContent>
        </Card>

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

const TeamTagsContainer = Relay.createContainer(injectIntl(TeamTagsComponent), {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        slug
        permissions
        tag_texts(first: 10000) {
          edges {
            node {
              id
              dbid
              text
              teamwide
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
  const params = { propTeam: props.team, direction: props.direction };
  return (
    <Relay.RootContainer
      Component={TeamTagsContainer}
      route={route}
      renderFetched={data => <TeamTagsContainer {...data} {...params} />}
    />
  );
};

export default TeamTags;
