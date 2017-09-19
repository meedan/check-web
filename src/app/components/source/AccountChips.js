import React from 'react';
import MediaUtil from '../media/MediaUtil';

class AccountChips extends React.Component {
  render() {
    const accounts = this.props.accounts;

    if (accounts) {
      return (
        <div className="media-tags">
          <ul className="media-tags__list">
            { accounts.map((account, index) => <li key={index} className="media-tags__tag">
              { MediaUtil.socialIcon(`${account.provider}.com`) /* TODO: refactor */ }
              <a href={account.url} target="_blank" rel="noopener noreferrer">
                { account.embed.username || account.embed.url }
              </a>
            </li>) }
          </ul>
        </div>
      );
    }
  }
}

export default AccountChips;
