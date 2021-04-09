import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import RadioButtonIcon from '@material-ui/icons/RadioButtonUnchecked';
import { Link } from 'react-router';
import ShortTextIcon from '@material-ui/icons/ShortText';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import FormatQuoteIcon from '@material-ui/icons/FormatQuote';
import LinkIcon from '@material-ui/icons/Link';
import ImageIcon from '@material-ui/icons/Image';
import IconFileUpload from '@material-ui/icons/CloudUpload';
import MediasLoading from '../media/MediasLoading';
import BlankState from '../layout/BlankState';
import FilterPopup from '../layout/FilterPopup';
import TeamSelect from '../team/TeamSelect';
import UserRoute from '../../relay/UserRoute';
import CheckContext from '../../CheckContext';
import { AlignOpposite } from '../../styles/js/shared';
import NumberIcon from '../../icons/NumberIcon';

const messages = defineMessages({
  filterByTeam: {
    id: 'userAssignments.filterByTeam',
    defaultMessage: 'Filter by workspace',
  },
});

const icons = {
  free_text: <ShortTextIcon />,
  number: <NumberIcon />,
  single_choice: <RadioButtonCheckedIcon />,
  multiple_choice: <CheckBoxIcon style={{ transform: 'scale(1,1)' }} />,
  geolocation: <LocationOnIcon />,
  datetime: <DateRangeIcon />,
  claim: <FormatQuoteIcon />,
  link: <LinkIcon />,
  uploadedimage: <ImageIcon />,
  file_upload: <IconFileUpload />,
};

class UserAssignmentsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teamId: null,
    };
  }

  componentWillMount() {
    let teamId = null;
    const { currentUser } = this.getContext().getContextStore();
    const { user } = this.props;
    user.teams.edges.forEach((team) => {
      const tid = parseInt(team.node.dbid, 10);
      if (tid === parseInt(currentUser.current_team_id, 10)) {
        teamId = tid;
      }
    });
    if (!teamId) {
      const team = user.teams.edges[0];
      if (team) {
        teamId = team.node.dbid;
      }
    }
    this.setState({ teamId });
  }

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate() {
    this.refresh();
  }

  getContext() {
    return new CheckContext(this);
  }

  refresh() {
    if (this.props.relay.variables.teamId !== this.state.teamId) {
      this.props.relay.setVariables({ teamId: this.state.teamId, userId: this.props.user.dbid });
      this.props.relay.forceFetch();
    }
  }

  handleSelect(e) {
    this.setState({ teamId: e.target.value });
  }

  render() {
    const { user } = this.props;

    if (this.props.relay.variables.teamId === null) {
      return null;
    }

    if (!user.assignments) {
      return null;
    }

    const assignments = {};
    const assignmentsWithoutProject = [];
    const projectPaths = {};
    const hasAssignment = user.assignments.edges.length > 0;

    user.assignments.edges.forEach((assignment) => {
      const a = assignment.node;
      if (a.project) {
        const project = a.project.title;
        if (!assignments[project]) {
          assignments[project] = [];
        }
        if (!projectPaths[project]) {
          projectPaths[project] = `/${a.team.slug}/project/${a.project_id}`;
        }
        a.path = `/${a.team.slug}/project/${a.project_id}/media/${a.dbid}`;
        assignments[project].push(a);
      } else {
        a.path = `/${a.team.slug}/media/${a.dbid}`;
        assignmentsWithoutProject.push(a);
      }
    });

    const options = [];
    user.teams.edges.forEach((team) => {
      options.push({
        label: team.node.name,
        value: team.node.dbid.toString(),
        icon: <RadioButtonIcon />,
        checkedIcon: <RadioButtonCheckedIcon />,
      });
    });

    const filterLabel = this.state.teamId ?
      options.find(o => o.value === this.state.teamId.toString()).label : null;

    return (
      <div id="assignments">
        <AlignOpposite>
          <FilterPopup
            label={filterLabel}
            tooltip={this.props.intl.formatMessage(messages.filterByTeam)}
          >
            <TeamSelect
              teams={user.teams.edges}
              value={this.state.teamId.toString()}
              onChange={this.handleSelect.bind(this)}
            />
          </FilterPopup>
        </AlignOpposite>
        { hasAssignment ? null : (
          <BlankState>
            <FormattedMessage id="userAssignments.blank" defaultMessage="No activity" />
          </BlankState>
        )}
        { assignmentsWithoutProject.length > 0 ? (
          <Box clone my={2}>
            <Card>
              <List>
                {assignmentsWithoutProject.map(assignment => (
                  <ListItem
                    button
                    component={Link}
                    to={assignment.path}
                    key={`media-${assignment.dbid}`}
                  >
                    <ListItemIcon>
                      {icons[assignment.report_type]}
                    </ListItemIcon>
                    <ListItemText>
                      {assignment.title}
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Box>
        ) : null }
      </div>
    );
  }
}

UserAssignmentsComponent.contextTypes = {
  store: PropTypes.object,
};

const UserAssignmentsContainer = Relay.createContainer(injectIntl(UserAssignmentsComponent), {
  initialVariables: {
    userId: null,
    teamId: null,
  },
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id
        dbid
        current_team_id
        name
        teams(first: 10000) {
          edges {
            node {
              id
              dbid
              slug
              name
              avatar
            }
          }
        }
        assignments(first: 10000, team_id: $teamId) {
          edges {
            node {
              id
              dbid
              title
              media {
                metadata
                embed_path
                quote
              }
              project_ids
              report_type
              team {
                id
                dbid
                slug
                name
              }
            }
          }
        }
      }
    `,
  },
});

const UserAssignments = (props) => {
  const userId = props.user.dbid;
  const route = new UserRoute({ userId });
  return (
    <Relay.RootContainer
      Component={UserAssignmentsContainer}
      route={route}
      renderLoading={() => <MediasLoading />}
      forceFetch
    />
  );
};

export default UserAssignments;
