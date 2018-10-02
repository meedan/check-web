import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { List, ListItem } from 'material-ui/List';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import IconFilter from 'material-ui/svg-icons/content/filter-list';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import deepEqual from 'deep-equal';
import styled from 'styled-components';
import TagTextCount from './TagTextCount';
import TeamRoute from '../../relay/TeamRoute';
import { units, ContentColumn, black32, black87 } from '../../styles/js/shared';
import Can, { can } from '../Can';
import Message from '../Message';
import CreateTagTextMutation from '../../relay/mutations/CreateTagTextMutation';
import UpdateTagTextMutation from '../../relay/mutations/UpdateTagTextMutation';
import DeleteTagTextMutation from '../../relay/mutations/DeleteTagTextMutation';

const StyledContentColumn = styled(ContentColumn)`
  .highlight {
    background-color: #FFF !important;
    -webkit-transition: background-color 1000ms linear !important;
    -ms-transition: background-color 1000ms linear !important;
    transition: background-color 1000ms linear !important;
  }
`;

class TeamTagsComponent extends Component {
  static handleClick() {
    setTimeout(() => {
      document.body.lastChild.style.zIndex = 9999;
    }, 100);
  }

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
      confirmed: false,
      countTotal: 0,
      countHidden: 0,
      teamwideTags: [],
      customTags: [],
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
    const teamwideTags = [];
    const customTags = [];
    let countTotal = 0;
    let countHidden = 0;
    this.props.team.teamwide_tags.edges.forEach((node) => {
      const tag = node.node;
      countTotal += 1;
      if (tag.text.toLowerCase().includes(this.state.search.toLowerCase())) {
        teamwideTags.push(tag);
      } else {
        countHidden += 1;
      }
    });
    this.props.team.custom_tags.edges.forEach((node) => {
      const tag = node.node;
      countTotal += 1;
      if (tag.text.toLowerCase().includes(this.state.search.toLowerCase())) {
        customTags.push(tag);
      } else {
        countHidden += 1;
      }
    });
    if (
      !deepEqual(teamwideTags, this.state.teamwideTags) ||
      !deepEqual(customTags, this.state.customTags) ||
      countTotal !== this.state.countTotal ||
      countHidden !== this.state.countHidden
    ) {
      this.setState({
        teamwideTags,
        customTags,
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

  handleConfirmation() {
    this.setState({ confirmed: !this.state.confirmed });
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
              defaultMessage="Sorry, could not update tag"
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

  handleChange(event, index, value) {
    this.setState({ sort: value });
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

  handleEdit(tag) {
    this.setState({ editing: tag });
  }

  handleDelete(tag) {
    this.setState({
      dialogOpen: true,
      tagToBeDeleted: tag,
      confirmed: false,
      message: null,
    });
  }

  handleDestroy() {
    this.setState({ deleting: true });

    const onSuccess = () => {
      this.setState({
        message: null,
        tagToBeDeleted: null,
        confirmed: false,
        dialogOpen: false,
        deleting: false,
      });
    };
    const onFailure = () => {
      this.setState({
        deleting: false,
        message: <FormattedMessage
          id="teamTags.failDelete"
          defaultMessage="Sorry, could not delete tag"
        />,
      });
    };

    const tag = this.state.tagToBeDeleted;
    if (tag && this.state.confirmed) {
      Relay.Store.commitUpdate(
        new DeleteTagTextMutation({
          teamId: this.props.team.id,
          id: tag.id,
        }),
        { onSuccess, onFailure },
      );
    }
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
          defaultMessage="Sorry, could not move tag"
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

  handleSearch(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      const search = document.getElementById('tag__search').value;
      this.setState({ search });
    }
  }

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
        message: <FormattedMessage id="teamTags.fail" defaultMessage="Sorry, could not add tag" />,
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
            <IconMenu
              style={{ margin: '0 12px' }}
              iconButtonElement={
                <IconButton style={{ padding: 0 }}>
                  <IconMoreHoriz />
                </IconButton>
              }
            >
              <MenuItem
                className="tag__edit"
                onClick={this.handleEdit.bind(this, tag)}
              >
                <FormattedMessage id="teamTags.editTag" defaultMessage="Edit tag" />
              </MenuItem>
              <MenuItem
                className="tag__delete"
                onClick={this.handleDelete.bind(this, tag)}
              >
                <FormattedMessage id="teamTags.deleteTag" defaultMessage="Delete tag" />
              </MenuItem>
              { showMove ? (
                <MenuItem
                  className="tag__move"
                  onClick={this.handleMove.bind(this, tag)}
                >
                  <FormattedMessage id="teamTags.moveTag" defaultMessage="Move to teamwide tags" />
                </MenuItem>) : null }
            </IconMenu>) : null;

          if (this.state.editing && this.state.editing.dbid === tag.dbid) {
            return (
              <ListItem disabled key={tag.dbid} style={{ paddingTop: 0, paddingBottom: 0 }}>
                <TextField
                  style={{ paddingTop: 0, paddingBottom: 0 }}
                  id="tag__edit"
                  autoFocus
                  onKeyPress={this.handleUpdate.bind(this)}
                  defaultValue={tag.text}
                />
                {' '}
                <IconClose
                  style={{ cursor: 'pointer', verticalAlign: 'sub' }}
                  onClick={this.handleCancelUpdate.bind(this)}
                />
              </ListItem>
            );
          }

          return (
            <ListItem
              disabled
              style={{ padding: `${units(2)} 0` }}
              primaryText={
                <span>
                  {tag.text}
                  <br />
                  <small style={{ color: black32 }}>
                    <FormattedMessage
                      id="teamTags.itemsCount"
                      defaultMessage="{count, plural, =0 {no items} one {1 item} other {# items}}"
                      values={{ count: tag.tags_count }}
                    />
                  </small>
                </span>
              }
              rightIcon={menu}
              key={tag.dbid}
              id={`tag__text-${tag.text}`}
            />
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
    const teamwideTags = this.state.teamwideTags.slice(0).sort(sortFunctions[this.state.sort]);
    const customTags = this.state.customTags.slice(0).sort(sortFunctions[this.state.sort]);

    const actions = [
      <FlatButton
        label={<FormattedMessage id="teamTags.cancelDelete" defaultMessage="Cancel" />}
        onClick={this.handleCloseDialog.bind(this)}
      />,
      <FlatButton
        id="tag__confirm-delete"
        label={<FormattedMessage id="teamTags.continue" defaultMessage="Continue" />}
        primary
        keyboardFocused
        onClick={this.handleDestroy.bind(this)}
        disabled={
          this.state.deleting ||
          !this.state.tagToBeDeleted ||
          !this.state.confirmed
        }
      />,
    ];

    return (
      <StyledContentColumn>
        <Message message={this.state.message} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h2><FormattedMessage id="teamTags.tags" defaultMessage="Tags" /></h2>
            <p style={{ margin: `${units(1)} 0` }}>
              <small>
                { this.state.countHidden > 0 ?
                  <FormattedMessage
                    id="teamTags.counter"
                    defaultMessage="{total, plural, =0 {No results} one {1 result ({hidden} hidden by filters)} other {# results ({hidden} hidden by filters)}}"
                    values={{
                      total: this.state.countTotal,
                      hidden: this.state.countHidden,
                    }}
                  /> :
                  <FormattedMessage
                    id="teamTags.counterNoHidden"
                    defaultMessage="{total, plural, =0 {No results} one {1 result} other {# results}}"
                    values={{
                      total: this.state.countTotal,
                      hidden: this.state.countHidden,
                    }}
                  /> }
              </small>
            </p>
          </div>
          <IconMenu
            clickCloseDelay={0}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            iconButtonElement={
              <IconButton
                tooltip={
                  <FormattedMessage id="teamTags.tooltip" defaultMessage="Filter and sort list" />
                }
              >
                <IconFilter />
              </IconButton>
            }
          >
            <MenuItem disabled>
              <TextField
                id="tag__search"
                fullWidth
                onBlur={this.handleBlur.bind(this)}
                onKeyPress={this.handleSearch.bind(this)}
                defaultValue={this.state.search}
                errorText={
                  <FormattedMessage
                    id="teamTags.searchTip"
                    defaultMessage="Type search term and press ENTER"
                  />
                }
                errorStyle={{ color: black87 }}
                floatingLabelText={
                  <FormattedMessage
                    id="teamTags.search"
                    defaultMessage="Search"
                  />
                }
                floatingLabelStyle={{ color: black87 }}
              />
            </MenuItem>
            <MenuItem disabled>
              <SelectField
                onClick={TeamTagsComponent.handleClick}
                fullWidth
                onChange={this.handleChange.bind(this)}
                value={this.state.sort}
                floatingLabelText={<FormattedMessage id="teamTags.sort" defaultMessage="Sort" />}
                floatingLabelFocusStyle={{ color: black87 }}
                floatingLabelStyle={{ color: black87 }}
                underlineStyle={{ borderColor: black87 }}
              >
                <MenuItem
                  value="az"
                  primaryText={<FormattedMessage id="teamTags.az" defaultMessage="A to Z" />}
                />
                <MenuItem
                  value="za"
                  primaryText={<FormattedMessage id="teamTags.za" defaultMessage="Z to A" />}
                />
                <MenuItem
                  value="of"
                  primaryText={<FormattedMessage id="teamTags.of" defaultMessage="Oldest first" />}
                />
                <MenuItem
                  value="nf"
                  primaryText={<FormattedMessage id="teamTags.nf" defaultMessage="Newest first" />}
                />
                <MenuItem
                  value="mu"
                  primaryText={<FormattedMessage id="teamTags.mu" defaultMessage="Most used" />}
                />
                <MenuItem
                  value="lu"
                  primaryText={<FormattedMessage id="teamTags.lu" defaultMessage="Least used" />}
                />
              </SelectField>
            </MenuItem>
          </IconMenu>
        </div>
        <Card>
          <CardHeader
            title={
              <FormattedMessage id="teamTags.teamwideTags" defaultMessage="Teamwide tags" />
            }
          />
          <CardText style={{ padding: 0 }}>
            { teamwideTags.length === 0 ?
              <p style={{ paddingBottom: units(5), textAlign: 'center' }}>
                <FormattedMessage
                  id="teamTags.noTeamwideTags"
                  defaultMessage="No teamwide tags."
                />
              </p>
              : null }
            {this.tagsList(teamwideTags, false)}
            <Can permissions={this.props.team.permissions} permission="create TagText">
              <div style={{ padding: units(2) }}>
                <TextField
                  id="tag__new"
                  onKeyUp={this.handleKeyUp.bind(this)}
                  onKeyPress={this.handleKeyPress.bind(this)}
                  floatingLabelText={<FormattedMessage id="teamTags.new" defaultMessage="New tag" />}
                  style={{ width: '50%' }}
                />
                <p>
                  <FlatButton
                    onClick={this.handleAddTag.bind(this)}
                    disabled={this.state.newTag.length === 0}
                    primary={this.state.newTag.length > 0}
                    label={
                      <FormattedMessage
                        id="teamTags.addTag"
                        defaultMessage="Add tag"
                      />
                    }
                  />
                </p>
              </div>
            </Can>
          </CardText>
        </Card>
        <Card style={{ marginTop: units(5) }}>
          <CardHeader
            title={
              <FormattedMessage id="teamTags.customTags" defaultMessage="Custom tags" />
            }
          />
          <CardText style={{ padding: 0 }}>
            { customTags.length === 0 ?
              <p style={{ paddingBottom: units(5), textAlign: 'center' }}>
                <FormattedMessage
                  id="teamTags.noCustomTags"
                  defaultMessage="No custom tags."
                />
              </p>
              : null }
            {this.tagsList(customTags, true)}
          </CardText>
        </Card>

        <Dialog
          actions={actions}
          modal={false}
          open={this.state.dialogOpen}
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          <Message message={this.state.message} />
          <h2>
            <FormattedMessage
              id="teamTags.confirmDeleteTitle"
              defaultMessage="Are you sure you want to delete this tag?"
            />
          </h2>
          <p style={{ margin: `${units(4)} 0` }}>
            <Checkbox
              id="tag__confirm"
              onCheck={this.handleConfirmation.bind(this)}
              checked={this.state.confirmed}
              label={<TagTextCount tag={this.state.tagToBeDeleted} />}
            />
          </p>
        </Dialog>
      </StyledContentColumn>
    );
  }
}

const TeamTagsContainer = Relay.createContainer(TeamTagsComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        slug
        permissions
        teamwide_tags(first: 10000) {
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
        custom_tags(first: 10000) {
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
