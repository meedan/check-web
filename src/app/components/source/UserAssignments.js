import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import rtlDetect from 'rtl-detect';
import { Card, CardHeader } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
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
import BlankState from '../layout/BlankState';
import CardHeaderOutside from '../layout/CardHeaderOutside';
import FilterPopup from '../layout/FilterPopup';
import TeamSelect from '../team/TeamSelect';
import MediaUtil from '../media/MediaUtil';
import UserRoute from '../../relay/UserRoute';
import CheckContext from '../../CheckContext';
import {
  units,
  inProgressYellow,
  unstartedRed,
  completedGreen,
} from '../../styles/js/shared';

const messages = defineMessages({
  filterByTeam: {
    id: 'userAssignments.filterByTeam',
    defaultMessage: 'Filter by team',
  },
  progress: {
    id: 'userAssignments.progress',
    defaultMessage: '{answered, plural, =0 {No required task answered} one {1 required task answered} other {# required tasks answered}}, out of {total}',
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
      this.props.relay.setVariables({ teamId: this.state.teamId, userId: this.props.userId });
    }
  }

  handleSelect(e) {
    this.setState({ teamId: e.target.value });
  }

  render() {
    const { user } = this.props;
    const { currentUser } = this.getContext().getContextStore();
    const isUserSelf = (user.id === currentUser.id);

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

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);
    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const filterLabel = this.state.teamId ?
      options.find(o => o.value === this.state.teamId.toString()).label : null;

    const cardTitle = isUserSelf ? (
      <FormattedMessage
        id="userAssignments.yourAssignments"
        defaultMessage="Your assignments"
      />
    ) : (
      <FormattedMessage
        id="userAssignments.userAssignments"
        defaultMessage="{name}'s assignments"
        values={{ name: user.name }}
      />
    );

    return (
      <div id="assignments">
        <CardHeaderOutside
          title={cardTitle}
          direction={direction}
          actions={
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
          }
        />
        { hasAssignment ? null : (
          <BlankState>
            <FormattedMessage id="userAssignments.blank" defaultMessage="No activity" />
          </BlankState>
        )}
        {Object.keys(assignments).map(project => (
          <Card key={project} style={{ marginTop: units(2), marginBottom: units(2) }}>
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
                      primaryText={
                        MediaUtil.title(assignment, assignment.metadata, this.props.intl)
                      }
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
              metadata
              assignments_progress(user_id: $userId)
              media {
                metadata
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
      renderFetched={data => <UserAssignmentsContainer {...data} userId={userId} />}
      forceFetch
    />
  );
};

export default UserAssignments;
