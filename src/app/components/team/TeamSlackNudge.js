import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Card, CardActions, CardText, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { stringHelper } from '../../customHelpers';
import { Row, units } from '../../styles/js/shared';

class TeamSlackNudge extends React.Component {
  handleClickUpgrade = () => {
    window.open(stringHelper('UPGRADE_URL'));
  };

  render() {
    const nudge = (
      <FormattedMessage
        id="teamSlackNudge.nudge"
        defaultMessage="Is your team on Slack? Check Pro allows you to set up custom Slack notifications for all activity, so you get all the latest activity on Check streamed directly to your Slack channels."
      />
    );

    const upgradeButton = (
      <FlatButton
        label={
          <FormattedMessage
            id="teamSlackNudge.upgradeButton"
            defaultMessage="Upgrade now"
          />
        }
        primary
        onClick={this.handleClickUpgrade}
      />
    );

    if (config.appName !== 'check') {
      return null;
    }

    if (this.props.renderCard) {
      return (
        <Card>
          <CardHeader
            title={
              <FormattedMessage
                id="teamSlackNudge.title"
                defaultMessage="Upgrade to Check Pro"
              />
            }
          />
          <CardText>
            {nudge}
          </CardText>
          <CardActions>
            {upgradeButton}
          </CardActions>
        </Card>
      );
    }

    return (
      <div>
        <Row>
          {nudge}
        </Row>
        <div style={{ marginTop: units(4) }}>
          {upgradeButton}
        </div>
      </div>
    );
  }
}

export default TeamSlackNudge;
