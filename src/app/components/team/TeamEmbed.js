import React from 'react';
import Relay from 'react-relay/classic';
import Checkbox from 'material-ui/Checkbox';
import { FormattedMessage } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import { ContentColumn, FlexRow, units } from '../../styles/js/shared';
import Can from '../Can';
import CardHeaderOutside from '../layout/CardHeaderOutside';
import TeamRoute from '../../relay/TeamRoute';
import Message from '../Message';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import { stringHelper } from '../../customHelpers';

class TeamEmbedComponent extends React.Component {
  constructor(props) {
    super(props);
    const selectedTasks = props.team.get_embed_tasks ? props.team.get_embed_tasks.split(',') : [];
    this.state = {
      message: null,
      selectedTasks,
      showAnalysis: !!props.team.get_embed_analysis,
    };
  }

  handleCheck(value) {
    const tasks = this.state.selectedTasks.slice(0);
    const index = tasks.indexOf(value.toString());
    if (index > -1) {
      tasks.splice(index, 1);
    } else {
      tasks.push(value.toString());
    }
    this.setState({ selectedTasks: tasks });
  }

  toggleAnalysis() {
    this.setState({ showAnalysis: !this.state.showAnalysis });
  }

  handleSubmit() {
    const disclaimer = document.getElementById('disclaimer').value;
    const embed_tasks = this.state.selectedTasks.join(',');

    const onFailure = () => {
      this.setState({
        message: <FormattedMessage
          id="teamEmbed.updateFail"
          defaultMessage="Sorry, an error occurred while updating the report settings. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />,
      });
    };

    const onSuccess = () => {
      this.setState({
        message: <FormattedMessage
          id="teamEmbed.updateSuccess"
          defaultMessage="Report settings updated successfully!"
        />,
      });
    };

    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        id: this.props.team.id,
        disclaimer,
        analysis: this.state.showAnalysis,
        embed_tasks,
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const { direction } = this.props;
    const { team_tasks, get_disclaimer, permissions } = this.props.team;

    return (
      <div>
        <ContentColumn>
          <Message message={this.state.message} />
          <CardHeaderOutside
            direction={direction}
            title={<FormattedMessage id="teamEmbed.title" defaultMessage="Report settings" />}
          />

          <Card style={{ marginTop: units(2) }}>
            <CardHeader
              title={
                <FormattedMessage id="teamEmbed.tasks" defaultMessage="Tasks" />
              }
              subtitle={
                <FormattedMessage id="teamEmbed.tasksSub" defaultMessage="The selected tasks will be included in the report if they are resolved." />
              }
            />
            <CardText>
              {team_tasks.edges.map(task => (
                <FlexRow key={task.node.dbid} style={{ justifyContent: 'start' }}>
                  <span>
                    <Checkbox
                      checked={this.state.selectedTasks.indexOf(task.node.dbid.toString()) > -1}
                      onCheck={this.handleCheck.bind(this, task.node.dbid)}
                    />
                  </span>
                  {' '}
                  <span style={{ fontSize: '1rem' }}>{task.node.label}</span>
                </FlexRow>
              ))}
            </CardText>
          </Card>

          <Card style={{ marginTop: units(2) }}>
            <CardHeader
              title={
                <FormattedMessage id="teamEmbed.disclaimer" defaultMessage="Disclaimer" />
              }
              subtitle={
                <FormattedMessage id="teamEmbed.disclaimerSub" defaultMessage="Disclaimer that will be shown at the bottom of the report with the workspace logo." />
              }
            />
            <CardText>
              <TextField
                style={{ paddingTop: 0, paddingBottom: 0 }}
                id="disclaimer"
                defaultValue={get_disclaimer}
                fullWidth
              />
            </CardText>
          </Card>

          <Card style={{ marginTop: units(2) }}>
            <CardHeader
              title={
                <FormattedMessage id="teamEmbed.analysis" defaultMessage="Analysis" />
              }
              subtitle={
                <FormattedMessage id="teamEmbed.analysisSub" defaultMessage="Show analysis in the report" />
              }
            />
            <CardText>
              <FlexRow style={{ justifyContent: 'flex-start' }}>
                <Checkbox
                  style={{ width: 'auto' }}
                  checked={this.state.showAnalysis}
                  onCheck={this.toggleAnalysis.bind(this)}
                />
                {' '}
                <FormattedMessage
                  id="teamEmbed.analysisYes"
                  defaultMessage="Yes"
                />
              </FlexRow>
            </CardText>
          </Card>

          <Can permissions={permissions} permission="update Team">
            <p style={{ marginTop: units(2), textAlign: direction.to }}>
              <FlatButton
                onClick={this.handleSubmit.bind(this)}
                label={
                  <FormattedMessage
                    id="teamEmbed.save"
                    defaultMessage="Save"
                  />
                }
              />
            </p>
          </Can>
        </ContentColumn>
      </div>
    );
  }
}

const TeamEmbedContainer = Relay.createContainer(TeamEmbedComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        permissions
        get_disclaimer
        get_embed_analysis
        get_embed_tasks
        team_tasks(first: 10000) {
          edges {
            node {
              id
              dbid
              label
            }
          }
        }
      }
    `,
  },
});

const TeamEmbed = (props) => {
  const route = new TeamRoute({ teamSlug: props.team.slug });
  const params = { propTeam: props.team, direction: props.direction };
  return (
    <Relay.RootContainer
      Component={TeamEmbedContainer}
      route={route}
      renderFetched={data => <TeamEmbedContainer {...data} {...params} />}
    />
  );
};

export default TeamEmbed;
