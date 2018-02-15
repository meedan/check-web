import React from 'react';
import Relay from 'react-relay';
import SourceRoute from '../../relay/SourceRoute';
import AccountCard from './AccountCard';

const SourceAccountsComponent = (props) => {
  const { source } = props;
  if (source && source.source && source.source.accounts) {
    return (
      <div>
        {source.source.accounts.edges.map(account => (
          <AccountCard key={account.node.id} account={account.node} />
        ))}
      </div>
    );
  }
  return null;
};

const SourceAccountsContainer = Relay.createContainer(SourceAccountsComponent, {
  fragments: {
    source: () => Relay.QL`
      fragment on ProjectSource {
        id
        dbid
        source {
          id
          dbid
          accounts(first: 10000) {
            edges {
              node {
                id,
                dbid,
                created_at,
                updated_at,
                embed,
                image,
                url,
                provider,
                user {
                  dbid,
                  name,
                  email,
                  source {
                    accounts(first: 10000) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
});

const SourceAccounts = (props) => {
  const ids = `${props.source.source_id},${props.source.project_id}`;
  const route = new SourceRoute({ ids });

  return (<Relay.RootContainer Component={SourceAccountsContainer} route={route} forceFetch />);
};

export default SourceAccounts;
