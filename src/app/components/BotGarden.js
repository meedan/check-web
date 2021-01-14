import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { Emojione } from 'react-emoji-render';
import { Link } from 'react-router';
import RootRoute from '../relay/RootRoute';
import { units, ContentColumn, black32 } from '../styles/js/shared';
import { botName } from '../helpers';

class BotGardenComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { root } = this.props;

    return (
      <ContentColumn>
        <h2 style={{ textAlign: 'center' }}>
          <FormattedMessage
            id="botGarden.botGarden"
            defaultMessage="Bot Garden"
          /> <Emojione text="🤖 🌼" />
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          { root.team_bots_approved.edges.map((team_bot) => {
            const bot = team_bot.node;
            if (bot.default) {
              return null;
            }
            return (
              <Card style={{ margin: units(2), width: 150 }} key={`bot-${bot.id}`}>
                <Link to={`/check/bot/${bot.dbid}`}>
                  <img src={bot.avatar} alt={bot.name} style={{ border: `1px solid ${black32}`, width: '100%' }} />
                  <CardHeader
                    className="bot-garden__bot-name"
                    title={botName(bot)}
                  />
                </Link>
                <CardContent>
                  {bot.team_author ?
                    <Link to={`/${bot.team_author.slug}`}>{bot.team_author.name}</Link> : null
                  }
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ContentColumn>
    );
  }
}

const BotGardenContainer = Relay.createContainer(BotGardenComponent, {
  fragments: {
    root: () => Relay.QL`
      fragment on RootLevel {
        team_bots_approved(first: 10000) {
          edges {
            node {
              id
              dbid
              avatar
              name
              default
              team_author {
                name
                slug
              }
            }
          }
        }
      }
    `,
  },
});

const BotGarden = () => {
  const route = new RootRoute();
  return (
    <Relay.RootContainer
      Component={BotGardenContainer}
      route={route}
    />
  );
};

export default BotGarden;
