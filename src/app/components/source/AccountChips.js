import React from 'react';
import styled from 'styled-components';
import { units, chipStyles } from '../../styles/js/shared';
import MediaUtil from '../media/MediaUtil';

const StyledTag = styled.li`
  ${chipStyles}
`;

const AccountChips = (props) => {
  const accounts = props.accounts;

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

  return null;
};

export default AccountChips;
