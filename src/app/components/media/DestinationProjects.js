import React from 'react';
import Relay from 'react-relay/classic';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { units } from '../../styles/js/shared';
import TeamRoute from '../../relay/TeamRoute';
import RelayContainer from '../../relay/RelayContainer';

class DestinationProjectsComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      valueSelected: null,
    };
  }

  componentDidMount() {
    this.props.onLoad();
  }

  componentWillUpdate(nextProps) {
    if (nextProps.team.projects.length > this.props.team.projects.length || !this.props.team) {
      this.props.onLoad();
    }
  }

  destinationProjects = (team, projectId) => {
    if (team.projects) {
      const projects = team.projects.edges.sortp((a, b) =>
        a.node.title.localeCompare(b.node.title));
      return projects.filter(p => p.node.dbid !== projectId);
    }

    return [];
  };

  selectCallback = (event, value) => {
    const project = this.props.team.projects.edges.find(p => p.node.dbid === value);
    this.setState({ valueSelected: value });
    if (this.props.onChange) {
      this.props.onChange(event, project.node);
    }
  };

  render() {
    const radios = [];
    this.destinationProjects(this.props.team, this.props.projectId).forEach((proj) => {
      radios.push(<RadioButton
        key={proj.node.dbid}
        label={proj.node.title}
        value={proj.node.dbid}
        style={{ padding: units(1) }}
      />);
    });

    return (
      <RadioButtonGroup
        name="moveMedia"
        className="media-detail__dialog-radio-group"
        onChange={this.selectCallback}
        valueSelected={this.state.valueSelected}
      >
        {radios}
      </RadioButtonGroup>
    );
  }
}

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
              search_id,
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
    <RelayContainer
      Component={DestinationProjectsContainer}
      route={route}
      renderFetched={data => <DestinationProjectsContainer {...props} {...data} />}
    />
  );
};

export default DestinationProjects;
