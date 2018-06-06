import React, { Component } from 'react';
import Relay from 'react-relay';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Card, CardHeader } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
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
import { units, headline, black38 } from '../../styles/js/shared';

class UserAssignmentsComponent extends Component {
  componentDidMount() {
    this.props.relay.setVariables({
      userId: this.props.userId,
    });
  }

  render() {
    const { user } = this.props;

    const assignments = {};
    let hasAssignment = false;

    user.assignments.edges.forEach((assignment) => {
      const a = assignment.node;
      const team = a.team.name;
      if (!assignments[team]) {
        assignments[team] = [];
      }
      a.proj_path = `/${a.team.slug}/project/${a.project_id}`;
      a.path = `${a.proj_path}/media/${a.dbid}`;
      let active = false;
      a.activeTasks = [];
      a.assignments.edges.forEach((node) => {
        const task = node.node;
        const data = JSON.parse(task.content);
        task.data = data;
        if (data.status === 'Unresolved') {
          active = true;
          a.activeTasks.push(task);
        }
      });
      const assignee = a.last_status_obj.assigned_to;
      if (active || (assignee && assignee.dbid === user.dbid)) {
        assignments[team].push(a);
        hasAssignment = true;
      }
    });

    const icons = {
      free_text: <MdShortText />,
      single_choice: <MdRadioButtonChecked />,
      multiple_choice: <MdCheckBox />,
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

    return (
      <div id="assignments">
        <StyledBlankState>
          {hasAssignment
            ? null
            : <FormattedMessage id="userAssignments.blank" defaultMessage="No activity yet" />
          }
        </StyledBlankState>
        {Object.keys(assignments).map(team => assignments[team].length ? (
          <Card key={team}>
            <CardHeader title={team} />
            <List>
              {assignments[team].map(assignment => (
                <div key={`div-${assignment.dbid}`}>
                  <ListItem
                    key={`media-${assignment.dbid}`}
                    containerElement={
                      assignment.last_status_obj.assigned_to &&
                      assignment.last_status_obj.assigned_to.dbid === user.dbid ?
                        <Link to={assignment.path} /> : <span />}
                    primaryText={MediaUtil.title(assignment, assignment.embed, this.props.intl)}
                    secondaryText={
                      <small>
                        <FormattedMessage
                          id="userAssignments.inProject"
                          defaultMessage="In project {link}"
                          values={{
                            link: <Link to={assignment.proj_path}>{assignment.project.title}</Link>,
                          }}
                        />
                      </small>
                    }
                    leftIcon={icons[assignment.report_type]}
                  />

                  <List style={{ marginLeft: units(5), marginRight: units(5) }}>
                    {assignment.activeTasks.map(task => (
                      <ListItem
                        key={`task-${task.dbid}`}
                        containerElement={<Link to={assignment.path} />}
                        primaryText={task.data.label}
                        leftIcon={icons[task.data.type]}
                      />
                    ))}
                  </List>
                </div>
              ))}
            </List>
          </Card>
        ) : null)}
      </div>
    );
  }
}

const UserAssignmentsContainer = Relay.createContainer(injectIntl(UserAssignmentsComponent), {
  initialVariables: {
    userId: 0,
  },
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id
        dbid
        assignments(first: 10000) {
          edges {
            node {
              id
              dbid
              embed
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
              last_status_obj {
                assigned_to {
                  dbid
                }
              }
              assignments(first: 10000, user_id: $userId, annotation_type: "task") {
                edges {
                  node {
                    id
                    dbid
                    content
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
});

const UserAssignments = (props) => {
  const route = new UserRoute({ userId: props.user.dbid });
  return (
    <Relay.RootContainer
      Component={UserAssignmentsContainer}
      route={route}
      forceFetch
      renderFetched={data => <UserAssignmentsContainer userId={props.user.dbid} {...data} />}
    />
  );
};

export default UserAssignments;
