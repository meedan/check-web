import React from 'react';
import Relay from 'react-relay';
import AutoComplete from 'material-ui/AutoComplete';
import TeamRoute from '../../relay/TeamRoute';
import RelayContainer from '../../relay/RelayContainer';

const AutoCompleteComponent = (props) => {
  const sources = props.team.sources.edges.map(obj => obj.node.name);
  return (
    <AutoComplete
      key="createMedia.quoteAttributionSource.input"
      id="create-media-quote-attribution-source-input"
      name="quoteAttributionSource"
      filter={AutoComplete.fuzzyFilter}
      hintText={props.hintText}
      dataSource={sources}
      {...props.inputProps}
    />
  );
};

const AutoCompleteContainer = Relay.createContainer(AutoCompleteComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        sources(first: 10000) {
          edges {
            node {
              id,
              dbid,
              name,
            }
          }
        }
      }
    `,
  },
});

const AutoCompleteClaimAttribution = (props) => {
  const teamSlug = props.team.slug;
  const route = new TeamRoute({ teamSlug });

  return (
    <RelayContainer
      Component={AutoCompleteContainer}
      route={route}
      renderFetched={data => <AutoCompleteContainer {...props} {...data} />}
    />
  );
};

export default AutoCompleteClaimAttribution;
