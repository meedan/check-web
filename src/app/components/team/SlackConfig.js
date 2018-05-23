import React from 'react';
import { FormattedMessage } from 'react-intl';
import Card, { CardHeader, CardContent } from 'material-ui-next/Card';
import Dialog from 'material-ui-next/Dialog';
import IconButton from 'material-ui-next/IconButton';
import Switch from 'material-ui-next/Switch';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';

class SlackConfig extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openDialog: false,
    };
  }

  render() {
    console.log('this.props.team');
    console.log(this.props.team);

    return (
      <div>
        <Card>
          <CardHeader
            title={
              <FormattedMessage
                id="slackConfig.title"
                defaultMessage="Slack integration"
              />
            }
            action={
              <IconButton>
                <IconMoreHoriz />
              </IconButton>
            }
          />
          <CardContent>
            <FormattedMessage
              id="slackConfig.text"
              defaultMessage="Notify a Slack channel every time someone adds to one of your projects."
            />
            <Switch
              checked={this.props.team.get_slack_notifications_enabled}
            />
          </CardContent>
        </Card>
        <Dialog
          open={this.state.openDialog}
        >
          <FormattedMessage
            id="slackConfig.text"
            defaultMessage="Notify a Slack channel every time someone adds to one of your projects."
          />
        </Dialog>
      </div>
    );
  }
}

export default SlackConfig;
