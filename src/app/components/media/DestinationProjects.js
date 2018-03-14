import React from 'react';
import Relay from 'react-relay';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { units } from '../../styles/js/shared';
import TeamRoute from '../../relay/TeamRoute';

const destinationProjects = (team, projectId) => {
  if (team.projects) {
    const projects = team.projects.edges.sortp((a, b) =>
      a.node.title.localeCompare(b.node.title));
    return projects.filter(p => p.node.dbid !== projectId);
  }

  return [];
};

const DestinationProjectsComponent = (props) => {
  const radios = [];
  destinationProjects(props.team, props.projectId).forEach((proj) => {
    radios.push(<RadioButton
      key={proj.node.dbid}
      label={proj.node.title}
      value={proj.node}
      style={{ padding: units(1) }}
    />);
  });
  return (
    <RadioButtonGroup
      name="moveMedia"
      className="media-detail__dialog-radio-group"
      onChange={props.onChange}
    >
      {radios}
    </RadioButtonGroup>
  );
};

const DestinationProjectsContainer = Relay.createContainer(DestinationProjectsComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        projects(first: 10000) {
          edges {
            node {
              id,
              dbid,
              title,
            }
          }
        }
      }
    `,
  },
});

const DestinationProjects = (props) => {
  const teamSlug = props.team.slug;
  const route = new TeamRoute({ teamSlug });

  return (
    <Relay.RootContainer
      Component={DestinationProjectsContainer}
      route={route}
      renderFetched={data => <DestinationProjectsContainer {...props} {...data} />}
    />
  );
};

export default DestinationProjects;
