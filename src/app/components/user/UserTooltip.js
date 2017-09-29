import React from 'react';
import Avatar from 'material-ui/Avatar';
import { Card, CardText } from 'material-ui/Card';
import ParsedText from '../ParsedText';
import { truncateLength } from '../../helpers';
import {
  units,
} from '../../styles/js/shared';

class UserTooltip extends React.Component {
  render() {
    console.log('this.props.user');
    console.log(this.props.user);

    const { user } = this.props;
    const { source } = this.props.user;

    return (
      <Card>
        <CardText>
          <Avatar
            className="avatar"
            src={user.source.image}
            alt={user.name}
            style={{ marginRight: units(2) }}
          />
          <div className="source__primary-info">
            <h1 className="source__name">
              {user.name}
            </h1>
            <div className="source__description">
              <p className="source__description-text">
                <ParsedText text={truncateLength(source.description, 600)} />
              </p>
            </div>
          </div>
        </CardText>
      </Card>
    );
  }
}

export default UserTooltip;
