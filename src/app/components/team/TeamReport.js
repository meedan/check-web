import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import HelpIcon from '@material-ui/icons/HelpOutline';
import { ContentColumn, units, checkBlue } from '../../styles/js/shared';
import Can from '../Can';
import TeamRoute from '../../relay/TeamRoute';
import Message from '../Message';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import { stringHelper } from '../../customHelpers';

class TeamReportComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      useIntroduction: props.team.get_use_introduction,
      useDisclaimer: props.team.get_use_disclaimer,
    };
  }

  handleToggle(field, e) {
    const state = {};
    state[field] = e.target.checked;
    this.setState(state);
  }

  handleSubmit() {
    const disclaimer = document.getElementById('disclaimer').value;
    const introduction = document.getElementById('introduction').value;
    const use_disclaimer = document.getElementById('use_disclaimer').checked;
    const use_introduction = document.getElementById('use_introduction').checked;

    const onFailure = () => {
      this.setState({
        message: <FormattedMessage
          id="teamReport.updateFail"
          defaultMessage="Sorry, an error occurred while updating the report settings. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />,
      });
    };

    const onSuccess = () => {
      this.setState({
        message: <FormattedMessage
          id="teamReport.updateSuccess"
          defaultMessage="Report settings updated successfully!"
        />,
      });
    };

    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        id: this.props.team.id,
        disclaimer,
        introduction,
        use_disclaimer,
        use_introduction,
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const {
      get_disclaimer,
      get_introduction,
      permissions,
    } = this.props.team;

    return (
      <div>
        <ContentColumn>
          <Message message={this.state.message} />
          <Can permissions={permissions} permission="update Team">
            <p style={{ marginTop: units(2), textAlign: 'end' }}>
              <Button onClick={this.handleSubmit.bind(this)}>
                <FormattedMessage id="teamReport.save" defaultMessage="Save" />
              </Button>
            </p>
          </Can>
          <Card style={{ marginTop: units(2) }}>
            <CardHeader
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FormattedMessage
                    id="teamReport.title"
                    defaultMessage="Default report settings"
                  />
                  <a href="http://help.checkmedia.org/en/articles/3627266-check-message-report" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <HelpIcon style={{ margin: '0 2px', color: checkBlue }} />
                  </a>
                </div>
              }
              subheader={
                <FormattedMessage
                  id="teamReport.subtitle"
                  defaultMessage="The content you set here can be edited in each individual report"
                />
              }
            />
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={this.state.useIntroduction}
                  id="use_introduction"
                  onChange={this.handleToggle.bind(this, 'useIntroduction')}
                />
                <h3><FormattedMessage id="teamReport.introduction" defaultMessage="Introduction" /></h3>
              </div>
              <TextField
                style={{ paddingTop: 0, paddingBottom: 0 }}
                id="introduction"
                defaultValue={get_introduction}
                multiline
                variant="outlined"
                rows="10"
                fullWidth
              />
              <div style={{ lineHeight: '1.5em', marginTop: units(1) }}>
                <FormattedMessage
                  id="teamReport.introductionSub"
                  defaultMessage="Use {query_date} placeholder to display the date of the original query. Use {status} to communicate the status of the article."
                  values={{
                    query_date: '{{query_date}}',
                    status: '{{status}}',
                  }}
                />
                <a href="http://help.checkmedia.org/en/articles/3627266-check-message-report" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', verticalAlign: 'bottom' }}>
                  <HelpIcon style={{ margin: '0 2px', color: checkBlue }} />
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: units(4) }}>
                <Checkbox
                  checked={this.state.useDisclaimer}
                  id="use_disclaimer"
                  onChange={this.handleToggle.bind(this, 'useDisclaimer')}
                />
                <h3><FormattedMessage id="teamReport.disclaimer" defaultMessage="Disclaimer" /></h3>
              </div>
              <TextField
                style={{ paddingTop: 0, paddingBottom: 0 }}
                id="disclaimer"
                defaultValue={get_disclaimer}
                fullWidth
              />
              <div style={{ lineHeight: '1.5em', marginTop: units(1) }}>
                <FormattedMessage id="teamReport.disclaimerSub" defaultMessage="Disclaimer that will be shown at the bottom of the report with the workspace logo." />
              </div>
            </CardContent>
          </Card>
        </ContentColumn>
      </div>
    );
  }
}

const TeamReportContainer = Relay.createContainer(TeamReportComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        permissions
        get_disclaimer
        get_introduction
        get_use_disclaimer
        get_use_introduction
      }
    `,
  },
});

const TeamReport = (props) => {
  const route = new TeamRoute({ teamSlug: props.team.slug });
  const params = { propTeam: props.team };
  return (
    <Relay.RootContainer
      Component={TeamReportContainer}
      route={route}
      renderFetched={data => <TeamReportContainer {...data} {...params} />}
    />
  );
};

export default TeamReport;
