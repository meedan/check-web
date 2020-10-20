import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { Emojione } from 'react-emoji-render';
import { Link } from 'react-router';
import RootRoute from '../relay/RootRoute';
import { units, ContentColumn, black32 } from '../styles/js/shared';

class BotGardenComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { root } = this.props;

    return (
      <ContentColumn>
        <Box clone textAlign="center">
          <h2>
            <FormattedMessage
              id="botGarden.botGarden"
              defaultMessage="Bot Garden"
            /> <Emojione text="🤖 🌼" />
          </h2>
        </Box>
        <Box display="flex" flexWrap="wrap">
          { root.team_bots_approved.edges.map((team_bot) => {
            const bot = team_bot.node;

            return (
              <Box clone m={units(2)} width={150}>
                <Card key={`bot-${bot.id}`}>
                  <Link to={`/check/bot/${bot.dbid}`}>
                    <Box clone border={`1px solid ${black32}`} width="100%">
                      <img src={bot.avatar} alt={bot.name} />
                    </Box>
                    <CardHeader
                      className="bot-garden__bot-name"
                      title={bot.name}
                    />
                  </Link>
                  <CardContent>
                    {bot.team_author ?
                      <Link to={`/${bot.team_author.slug}`}>{bot.team_author.name}</Link> : null
                    }
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
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
