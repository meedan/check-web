import React, { Component, PropTypes } from 'react';
import Avatar from 'material-ui/Avatar';

class SourceHeader extends Component {
  render() {
    const source = this.props.source;
    return (
      <div className="source-header">
        <Avatar className="source-avatar" size={100} src={source.image} />
        <h2 className="source-name">{source.name}</h2>
        <p className="source-slogan">{source.description}</p>

        <ul className="source-accounts">
          {source.accounts.edges.map((account) => {
            const node = account.node;
            return (
              <li>
                <a href={node.url} rel="noopener noreferrer" target="_blank">
                  {/* Icon goes here, but react-fontawesome was removed. CGB 2017-2-14 */}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default SourceHeader;
