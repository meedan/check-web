import React from 'react';
import { FormattedMessage } from 'react-intl';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
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
        defaultMessage="{max, plural, one {Your workspace is currently limited to one member. To upgrade, please contact {supportEmail}.} other {Your workspace is currently limited to # members. To upgrade, please contact {supportEmail}.}}"
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
          <CardContent>
            {nudge}
          </CardContent>
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
