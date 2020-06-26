import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { MdContentCopy } from 'react-icons/md';
import DoneIcon from '@material-ui/icons/Done';
import CheckContext from '../../CheckContext';
import UserUtil from '../user/UserUtil';
import { encodeSvgDataUri } from '../../helpers';
import { checkBlue, white, title1 } from '../../styles/js/shared';

// TODO load SVG from a file with a Webpack loader
const teamInviteSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" opacity="0.2" width="24" height="24" viewBox="0 0 24 24"><path d="M16,13C15.71,13 15.38,13 15.03,13.05C16.19,13.89 17,15 17,16.5V19H23V16.5C23,14.17 18.33,13 16,13M8,13C5.67,13 1,14.17 1,16.5V19H15V16.5C15,14.17 10.33,13 8,13M8,11A3,3 0 0,0 11,8A3,3 0 0,0 8,5A3,3 0 0,0 5,8A3,3 0 0,0 8,11M16,11A3,3 0 0,0 19,8A3,3 0 0,0 16,5A3,3 0 0,0 13,8A3,3 0 0,0 16,11Z"/></svg>';

const Styles = theme => ({
  // Inspired by https://material-ui.com/components/cards/#ui-controls
  root: {
    display: 'flex',
    backgroundColor: checkBlue,
    color: white,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: '30%',
    margin: theme.spacing(0, 2),
  },
  url: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  urlCopy: {
    flexGrow: 1,
    textAlign: 'end',
  },
  title: {
    color: white,
    font: title1,
  },
});

class TeamInviteCard extends Component {
  constructor(props) {
    super(props);
    this.state = { copied: false };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  render() {
    const { classes, team } = this.props;
    const role = UserUtil.myRole(this.getCurrentUser(), team.slug);
    if (!role) {
      return null;
    }

    const teamUrl = `${window.location.origin}/${team.slug}`;
    const joinUrl = `${teamUrl}/join`;

    return (
      <Card className={classes.root}>
        <CardMedia className={classes.cover} image={encodeSvgDataUri(teamInviteSvg)} />
        <div className={classes.details}>
          <CardContent>
            <Typography component="h2" className={classes.title}>
              <FormattedMessage id="teamInviteCard.title" defaultMessage="Invite members" />
            </Typography>
            <p>
              <FormattedMessage
                id="teamMembersComponent.inviteLink"
                defaultMessage="To invite colleagues to join {teamName}, send them this link:"
                values={{ teamName: this.props.team.name }}
              />
            </p>
            <div className={classes.url}>
              <p>{joinUrl}</p>
              <div className={classes.urlCopy}>
                <CopyToClipboard text={joinUrl} onCopy={() => this.setState({ copied: true })}>
                  {this.state.copied ?
                    <Button variant="contained" startIcon={<DoneIcon />}>
                      <FormattedMessage id="teamInviteCard.copy" defaultMessage="COPIED!" />
                    </Button> :
                    <Button variant="contained" startIcon={<MdContentCopy />}>
                      <FormattedMessage id="teamInviteCard.copied" defaultMessage="COPY" />
                    </Button>
                  }
                </CopyToClipboard>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }
}

TeamInviteCard.contextTypes = {
  store: PropTypes.object,
};

export default withStyles(Styles)(TeamInviteCard);
