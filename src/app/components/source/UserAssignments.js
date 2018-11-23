import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import { Card, CardHeader } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import IconFilter from 'material-ui/svg-icons/content/filter-list';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonIcon from '@material-ui/icons/RadioButtonUnchecked';
import { Link } from 'react-router';
import MdShortText from 'react-icons/lib/md/short-text';
import MdRadioButtonChecked from 'react-icons/lib/md/radio-button-checked';
import MdCheckBox from 'react-icons/lib/md/check-box';
import MdLocationOn from 'react-icons/lib/md/location-on';
import MdDateRange from 'react-icons/lib/md/date-range';
import MdFormatQuote from 'react-icons/lib/md/format-quote';
import MdLink from 'react-icons/lib/md/link';
import MdImage from 'react-icons/lib/md/image';
import styled from 'styled-components';
import UserRoute from '../../relay/UserRoute';
import MediaUtil from '../media/MediaUtil';
import {
  headline,
  black38,
  inProgressYellow,
  unstartedRed,
  completedGreen,
} from '../../styles/js/shared';
import MultiSelector from '../layout/MultiSelector';

const messages = defineMessages({
  filterByTeam: {
    id: 'userAssignments.filterByTeam',
    defaultMessage: 'Filter by team',
  },
  progress: {
    id: 'userAssignments.progress',
    defaultMessage: '{answered} required tasks answered, out of {total}',
  },
});

const icons = {
  free_text: <MdShortText />,
  single_choice: <MdRadioButtonChecked />,
  multiple_choice: <MdCheckBox style={{ transform: 'scale(1,1)' }} />,
  geolocation: <MdLocationOn />,
  datetime: <MdDateRange />,
  claim: <MdFormatQuote />,
  link: <MdLink />,
  uploadedimage: <MdImage />,
};

const StyledBlankState = styled.div`
  font: ${headline};
  color: ${black38};
  text-align: center;
`;

class UserAssignmentsComponent extends Component {
  constructor(props) {
    super(props);
    let teamId = null;
    props.user.teams.edges.forEach((team) => {
      const tid = parseInt(team.node.dbid, 10);
      if (tid === parseInt(props.user.current_team_id, 10)) {
        teamId = tid;
      }
    });
    if (!teamId) {
      const team = props.user.teams.edges[0];
      if (team) {
        teamId = team.node.dbid;
      }
    }
    this.state = {
      anchorEl: null,
      teamId,
    };
  }

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate() {
    this.refresh();
  }

  refresh() {
    if (this.props.relay.variables.teamId !== this.state.teamId) {
      this.props.relay.setVariables({ teamId: this.state.teamId });
    }
  }

  handleClick(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleSelect(selected) {
    const teamId = parseInt(selected[0], 10);
    this.setState({ anchorEl: null, teamId });
  }

  render() {
    const { user } = this.props;
    const { anchorEl } = this.state;

    if (this.props.relay.variables.teamId === null) {
      return null;
    }

    if (!user.assignments) {
      return null;
    }

    const assignments = {};
    const projectPaths = {};
    const hasAssignment = user.assignments.edges.length > 0;

    user.assignments.edges.forEach((assignment) => {
      const a = assignment.node;
      const project = a.project.title;
      if (!assignments[project]) {
        assignments[project] = [];
      }
      if (!projectPaths[project]) {
        projectPaths[project] = `/${a.team.slug}/project/${a.project_id}`;
      }
      a.path = `/${a.team.slug}/project/${a.project_id}/media/${a.dbid}`;
      assignments[project].push(a);
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

    return (
      <div id="assignments">
        <StyledBlankState>
          { hasAssignment ?
            <div style={{ textAlign: this.props.isRtl ? 'left' : 'right' }}>
              <Button
                onClick={this.handleClick.bind(this)}
                title={
                  this.props.intl.formatMessage(messages.filterByTeam)
                }
              >
                <IconFilter />
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={this.handleClose.bind(this)}
              >
                <MultiSelector
                  single
                  allowSearch
                  options={options}
                  selected={this.props.relay.variables.teamId.toString()}
                  onDismiss={this.handleClose.bind(this)}
                  onSubmit={this.handleSelect.bind(this)}
                />
              </Menu>
            </div>
            : <FormattedMessage id="userAssignments.blank" defaultMessage="No activity" />
          }
        </StyledBlankState>
        {Object.keys(assignments).map(project => (
          <Card key={project}>
            <CardHeader title={
              <Link to={projectPaths[project]}>
                {project}
              </Link>}
            />
            <List>
              {assignments[project].map((assignment) => {
                const progress = assignment.assignments_progress || {};
                const { answered, total } = progress;

                let color = inProgressYellow;
                if (answered === 0 && total > 0) {
                  color = unstartedRed;
                } else if (answered === total) {
                  color = completedGreen;
                }

                return (
                  <div key={`div-${assignment.dbid}`}>
                    <ListItem
                      key={`media-${assignment.dbid}`}
                      containerElement={<Link to={assignment.path} />}
                      primaryText={MediaUtil.title(assignment, assignment.embed, this.props.intl)}
                      rightAvatar={
                        (progress && (answered > 0 || total > 0)) ?
                          <Avatar
                            backgroundColor={color}
                            color="#fff"
                            style={{ fontSize: 12 }}
                            title={
                              this.props.intl.formatMessage(messages.progress, {
                                answered: assignment.assignments_progress.answered,
                                total: assignment.assignments_progress.total,
                              })
                            }
                          >
                            {answered}/{total}
                          </Avatar>
                          : null
                      }
                      leftIcon={icons[assignment.report_type]}
                    />
                  </div>
                );
              })}
            </List>
          </Card>
        ))}
      </div>
    );
  }
}

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
        teams(first: 10000) {
          edges {
            node {
              id
              dbid
              slug
              name
            }
          }
        }
        assignments(first: 10000, team_id: $teamId) {
          edges {
            node {
              id
              dbid
              embed
              assignments_progress
              media {
                embed
                embed_path
                quote
              }
              overridden
              project_id
              report_type
              project {
                id
                dbid
                title
              }
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
      forceFetch
    />
  );
};

export default UserAssignments;
