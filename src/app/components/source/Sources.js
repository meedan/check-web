import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import { GridTile } from 'material-ui/GridList';
import RootRoute from '../../relay/RootRoute';

class SourcesComponent extends Component {
  render() {
    const prefix = '/source/';

    return (
      <div className="sources">
        <h2 className="sources__heading">Sources</h2>

        <ul className="sources__list">
          {this.props.root.sources.edges.map(source => (
            <li className="sources__source">
              <Link className="sources__source-link" to={prefix + source.node.dbid}>
                <img className="sources__source-avatar" src={source.node.image} />
                <span className="sources__source-name">{source.node.name}</span>
                <span className="sources__source-description">{source.node.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

const SourcesContainer = Relay.createContainer(SourcesComponent, {
  fragments: {
    root: () => Relay.QL`
      fragment on RootLevel {
        sources(first: 10000) {
          edges {
            node {
              id,
              dbid,
              name,
              image,
              description
            }
          }
        }
      }
    `,
  },
});

class Sources extends Component {
  render() {
    const route = new RootRoute();
    return (<Relay.RootContainer Component={SourcesContainer} route={route} forceFetch />);
  }
}

export default Sources;
