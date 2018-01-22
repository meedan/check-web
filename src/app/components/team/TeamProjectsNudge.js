import React from 'react';
import { Card, CardActions, CardText, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

const TeamProjectsNudge = (props) => {
  if (props.renderCard) {
    return (
      <Card>
        <CardHeader
          title="Upgrade to Check Pro"
        />
        <CardText>
          Want to add more projects?
          Free accounts can host up to 1 project at a time, and Check Pro
          allows you add an unlimited number of projects.
        </CardText>
        <CardActions>
          <FlatButton
            label="No, thanks"
          />
          <FlatButton
            label="Upgrade now"
            primary
          />
        </CardActions>
      </Card>
    );
  }

  return null;
};

export default TeamProjectsNudge;
