import React, { Component, PropTypes } from 'react';
import Avatar from 'material-ui/Avatar';
import FontAwesome from 'react-fontawesome';

class SourceHeader extends Component {
  render() {
    const source = this.props.source;
    return (
      <div className="source-header">
        <Avatar className="source-avatar" size={100} src={source.image} />
        <h2 className="source-name">{source.name}</h2>
        <p className="source-slogan">{source.description}</p>

        <ul className="source-accounts">
        {source.accounts.edges.map(function(account) {
          const node = account.node;
          return (
            <li>
              <a href={node.url} target="_blank">
                <FontAwesome name={node.provider} />
              </a>
            </li>
          );
        })}
        </ul>
      </div>
    )
  }
}

export default SourceHeader;
