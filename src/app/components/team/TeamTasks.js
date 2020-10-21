import React from "react";
import Relay from "react-relay/classic";
import { FormattedMessage } from "react-intl";
import intersection from "lodash.intersection";
import Box from "@material-ui/core/Box";
import TeamTasksProject from "./TeamTasksProject";
import CreateTeamTask from "./CreateTeamTask";
import ProjectSelector from "../project/ProjectSelector";
import TaskTypeSelector from "../task/TaskTypeSelector";
import BlankState from "../layout/BlankState";
import CardToolbar from "../layout/CardToolbar";
import FilterPopup from "../layout/FilterPopup";
import TeamRoute from "../../relay/TeamRoute";
import { ContentColumn, units } from "../../styles/js/shared";

class TeamTasksComponent extends React.Component {
  state = {
    projFilter: [],
    typeFilter: [],
  };

  handleSelectProjects = (projFilter) => {
    this.setState({ projFilter });
  };

  handleSelectTaskTypes = (typeFilter) => {
    this.setState({ typeFilter });
  };

  handleSearchChange = (e) => {
    this.setState({ search: e.target.value });
  };

  filterTeamTasks = (team_tasks) => {
    const { projFilter, typeFilter, search } = this.state;
    let filteredTeamTasks = team_tasks || [];

    if (search) {
      filteredTeamTasks = filteredTeamTasks.filter((t) =>
        t.node.label.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter.length) {
      filteredTeamTasks = filteredTeamTasks.filter(
        (t) => typeFilter.indexOf(t.node.type) > -1
      );
    }

    if (projFilter.length) {
      const projFilterInt = projFilter.map((f) => parseInt(f, 10));
      filteredTeamTasks = filteredTeamTasks.filter(
        (t) =>
          intersection(t.node.project_ids, projFilterInt).length > 0 ||
          !t.node.project_ids.length
      );
    }

    return filteredTeamTasks;
  };

  filterProjects = (projects) => {
    const { projFilter } = this.state;
    if (projFilter.length) {
      return projects.filter((p) => projFilter.indexOf(`${p.node.dbid}`) > -1);
    }
    return projects;
  };

  // eslint-disable-next-line class-methods-use-this
  renderFilterLabel(filtered, raw) {
    if (filtered.length !== raw.length) {
      return (
        <FormattedMessage
          id="teamTasks.filterLabelHidden"
          defaultMessage="{total, plural, =0 {No tasks} one {1 task ({hidden} hidden by filters)} other {# tasks ({hidden} hidden by filters)}}"
          values={{ total: raw.length, hidden: raw.length - filtered.length }}
        />
      );
    }

    return (
      <FormattedMessage
        id="teamTasks.filterLabel"
        defaultMessage="{total, plural, =0 {No tasks} one {1 task} other {# tasks}}"
        values={{ total: raw.length }}
      />
    );
  }

  renderTeamTaskList(teamTasks) {
    if (teamTasks.length) {
      return (
        <TeamTasksProject
          fieldset={this.props.fieldset}
          project={{ teamTasks }}
          team={this.props.team}
        />
      );
    }

    return (
      <BlankState>
        {this.props.fieldset === "tasks" ? (
          <FormattedMessage
            id="teamTasks.blank"
            defaultMessage="No default tasks to display"
          />
        ) : (
          <FormattedMessage
            id="teamTasks.blankMetadata"
            defaultMessage="No metadata fields"
          />
        )}
      </BlankState>
    );
  }

  render() {
    const { fieldset } = this.props;
    const isTask = this.props.fieldset === "tasks";
    const { team_tasks } = this.props.team;
    const filteredTasks = this.filterTeamTasks(team_tasks.edges).map(
      (task) => task.node
    );
    const filterLabel = this.renderFilterLabel(filteredTasks, team_tasks.edges);

    return (
      <div className="team-tasks">
        <ContentColumn>
          <CardToolbar
            action={
              <Box alignItems="center" display="flex">
                {isTask ? (
                  <FilterPopup
                    search={this.state.search}
                    onSearchChange={this.handleSearchChange}
                    label={filterLabel}
                    tooltip={
                      <FormattedMessage
                        id="teamTasks.filter"
                        defaultMessage="Filter tasks"
                      />
                    }
                  >
                    <Box mt={units(4)}>
                      <FormattedMessage
                        id="teamTasks.projFilter"
                        defaultMessage="Show tasks in"
                      />
                      <ProjectSelector
                        projects={this.props.team.projects.edges}
                        selected={this.state.projFilter}
                        onSelect={this.handleSelectProjects}
                        fullWidth
                      />
                    </Box>
                    <Box mt={units(2)} >
                      <FormattedMessage
                        id="teamTasks.typeFilter"
                        defaultMessage="Task type"
                      />
                      <TaskTypeSelector
                        selected={this.state.typeFilter}
                        onSelect={this.handleSelectTaskTypes}
                        fullWidth
                      />
                    </Box>
                  </FilterPopup>
                ) : null}
                <CreateTeamTask fieldset={fieldset} team={this.props.team} />
              </Box>
            }
            helpUrl={
              isTask
                ? "https://help.checkmedia.org/en/articles/3648632-tasks"
                : "https://help.checkmedia.org/en/articles/4346772-metadata"
            }
            title={
              isTask ? (
                <FormattedMessage id="teamTasks.tasks" defaultMessage="Tasks" />
              ) : (
                <FormattedMessage
                  id="teamTasks.metadata"
                  defaultMessage="Metadata"
                />
              )
            }
          />
          {this.renderTeamTaskList(filteredTasks)}
        </ContentColumn>
      </div>
    );
  }
}

const TeamTasksContainer = Relay.createContainer(TeamTasksComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        team_tasks(fieldset: "tasks", first: 10000) {
          edges {
            node {
              id
              dbid
              label
              description
              options
              type
              project_ids
              json_schema
              show_in_browser_extension
            }
          }
        }
        projects(first: 10000) {
          edges {
            node {
              title,
              dbid,
              id,
              medias_count,
            }
          }
        }
      }
    `,
  },
});

const TeamMetadataContainer = Relay.createContainer(TeamTasksComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        team_tasks(fieldset: "metadata", first: 10000) {
          edges {
            node {
              id
              dbid
              label
              description
              options
              type
              project_ids
              json_schema
              show_in_browser_extension
            }
          }
        }
      }
    `,
  },
});

const TeamTasks = (props) => {
  const { fieldset, team } = props;
  const route = new TeamRoute({ teamSlug: team.slug });

  if (fieldset === "tasks") {
    return (
      <Relay.RootContainer
        Component={TeamTasksContainer}
        route={route}
        renderFetched={(data) => (
          <TeamTasksContainer {...data} fieldset={fieldset} />
        )}
      />
    );
  }

  return (
    <Relay.RootContainer
      Component={TeamMetadataContainer}
      route={route}
      renderFetched={(data) => (
        <TeamMetadataContainer {...data} fieldset={fieldset} />
      )}
    />
  );
};

export default TeamTasks;
export { TeamTasksComponent };
