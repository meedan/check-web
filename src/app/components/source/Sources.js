import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';
import RootRoute from '../../relay/RootRoute';

class SourcesComponent extends Component {
  render() {
    return (
      <div className="sources">
        <h2>Sources</h2>
        
        <GridList cellHeight={200}>
        {this.props.root.sources.edges.map(source => (
          <Link to={'/source/' + source.node.dbid}>
            <GridTile key={source.node.id} title={source.node.name} subtitle={source.node.description}>
              <img src={source.node.image} />
            </GridTile>
          </Link>
        ))}
        </GridList>
      </div>
    );
  }
}

const SourcesContainer = Relay.createContainer(SourcesComponent, {
  fragments: {
    root: () => Relay.QL`
      fragment on RootLevel {
        sources(first: 20) {
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
    `
  }
});

class Sources extends Component {
  render() {
    var route = new RootRoute();
    return (<Relay.RootContainer Component={SourcesContainer} route={route} />);
  }
}

export default Sources;
