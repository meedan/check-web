import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Card, CardActions, CardText, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { stringHelper } from '../../customHelpers';
import { Row, units } from '../../styles/js/shared';

class TeamProjectsNudge extends React.Component {
  handleClickUpgrade = () => {
    window.open(stringHelper('UPGRADE_URL'));
  };

  render() {
    const nudge = (
      <FormattedMessage
        id="teamProjectsNudge.nudge"
        defaultMessage="Want to add more projects? Free accounts can host up to 1 project at a time, and Check Pro allows you to add an unlimited number of projects."
      />
    );

    const upgradeButton = (
      <FlatButton
        label={
          <FormattedMessage
            id="teamProjectsNudge.upgradeButton"
            defaultMessage="Upgrade now"
          />
        }
        primary
        onClick={this.handleClickUpgrade}
      />
    );

    if (this.props.renderCard) {
      return (
        <Card>
          <CardHeader
            title={
              <FormattedMessage
                id="teamProjectsNudge.title"
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

export default TeamProjectsNudge;
