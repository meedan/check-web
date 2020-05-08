import React from 'react';
import {
  QueryRenderer,
  graphql,
} from 'react-relay/compat';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import styled from 'styled-components';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { units } from '../../styles/js/shared';
import environment from '../../CheckEnvironment';

const messages = defineMessages({
  choose: {
    id: 'destinationProjects.choose',
    defaultMessage: 'Choose a list',
  },
});

/* eslint react/no-multi-comp: 0 */

class DestinationProjectsComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedValue: null,
    };
  }

  handleChange(selectedValue) {
    this.setState({ selectedValue });
    if (this.props.onChange) {
      let project = null;
      this.props.user.team_users.edges.forEach((teamUserNode) => {
        teamUserNode.node.team.projects.edges.forEach((projectNode) => {
          if (selectedValue && projectNode.node.dbid === selectedValue.value) {
            project = projectNode.node;
          }
        });
      });
      this.props.onChange(project);
    }
  }

  render() {
    const StyledSelect = styled(Select)`
      margin-top: ${units(3)};

      .Select-option {
        padding-left: ${units(2)};
        padding-right: ${units(2)};
      }
      .Select-option.is-disabled {
        cursor: default;
        padding-left: ${units(1)};
        padding-right: ${units(1)};
      }
    `;

    const options = [];
    this.props.user.team_users.edges.forEach((teamUserNode) => {
      if (teamUserNode.node.status === 'member') {
        const { team } = teamUserNode.node;
        let skip = false;
        if (
          (this.props.include && this.props.include.indexOf(team.slug) === -1) ||
          (this.props.exclude && this.props.exclude.indexOf(team.slug) > -1)
        ) {
          skip = true;
        }
        let projectIds = this.props.projectId;
        if (!Array.isArray(projectIds)) {
          projectIds = [projectIds];
        }
        if (!skip) {
          options.push({ label: team.name, value: team.slug, disabled: true });
          team.projects.edges.forEach((projectNode) => {
            const project = projectNode.node;
            if (projectIds.indexOf(project.dbid) === -1) {
              options.push({ label: project.title, value: project.dbid });
            }
          });
        }
      }
    });

    return (
      <StyledSelect
        value={this.state.selectedValue && this.state.selectedValue.value}
        onChange={this.handleChange.bind(this)}
        options={options}
        placeholder={this.props.intl.formatMessage(messages.choose)}
        style={{
          boxShadow: 'none',
        }}
      />
    );
  }
}

class DestinationProjects extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      parentProps: Object.assign({}, props),
      refetch: 0, // can be used by Pusher updates later
    };
  }

  refetchData() {
    this.setState({ refetch: this.state.refetch + 1 });
  }

  render() {
    const query = (
      <QueryRenderer
        environment={environment}
        variables={{ refetch: this.state.refetch }}
        query={graphql`
          query DestinationProjectsModernQuery {
            me {
              id
              team_users(first: 10000) {
                edges {
                  node {
                    id
                    status
                    team {
                      id
                      dbid
                      slug
                      name
                      projects(first: 10000) {
                        edges {
                          node {
                            id
                            dbid
                            title
                            search_id
                            medias_count
                          }
                        }
                      }
                    }
                  }
                }
              }
            }  
          }
        `}
        render={({ error, props }) => {
          if (error) {
            return null;
          }
          if (props && props.me) {
            return (
              <DestinationProjectsComponent
                user={props.me}
                refetchData={this.refetchData.bind(this)}
                {...this.state.parentProps}
              />
            );
          }
          return null;
        }}
      />
    );
    return query;
  }
}

DestinationProjectsComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(DestinationProjects);
