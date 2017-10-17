import React from 'react';
import MediaUtil from '../media/MediaUtil';
import { units, chipStyles } from '../../styles/js/shared';
import styled from 'styled-components';

const StyledTag = styled.li`
  ${chipStyles}
`;

class AccountChips extends React.Component {
  render() {
    const accounts = this.props.accounts;

    if (accounts) {
      return (
        <div className="media-tags">
          <ul className="media-tags__list">
            { accounts.map((account, index) => <StyledTag key={index} className="media-tags__tag">
              { MediaUtil.socialIcon(`${account.provider}.com`) /* TODO: refactor */ }
              <a href={account.url} style={{ margin: `0 ${units(1)}` }} target="_blank" rel="noopener noreferrer">
                { account.embed.username || account.embed.url }
              </a>
            </StyledTag>) }
          </ul>
        </div>
      );
    }
  }
}

export default AccountChips;
