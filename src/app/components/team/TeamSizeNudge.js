import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Card, CardText, CardHeader } from 'material-ui/Card';
import { stringHelper } from '../../customHelpers';
import { Row } from '../../styles/js/shared';

class TeamSizeNudge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const nudge = (
      <FormattedMessage
        id="teamSizeNudge.nudge"
        defaultMessage="{max, plural, =0 {Your workspace is currently limited to 0 users. To upgrade, please contact {supportEmail}.} one {Your workspace is currently limited to one user. To upgrade, please contact {supportEmail}.} other {Your workspace is currently limited to # users. To upgrade, please contact {supportEmail}.}}"
        values={{
          max: this.props.maxNumberOfMembers,
          supportEmail: stringHelper('SUPPORT_EMAIL'),
        }}
      />
    );

    if (this.props.renderCard) {
      return (
        <Card>
          <CardHeader
            title={
              <FormattedMessage
                id="teamSizeNudge.title"
                defaultMessage="Upgrade"
              />
            }
          />
          <CardText>
            {nudge}
          </CardText>
        </Card>
      );
    }

    return (
      <div>
        <Row>
          {nudge}
        </Row>
      </div>
    );
  }
}

export default TeamSizeNudge;
