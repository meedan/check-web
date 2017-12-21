import React from 'react';
import styled from 'styled-components';
import MediaUtil from '../media/MediaUtil';
import { units, chipStyles } from '../../styles/js/shared';

const StyledTag = styled.li`
  ${chipStyles}
`;

const AccountChips = (props) => {
  if (!props.accounts) return null;

  return (
    <div className="media-tags">
      <ul className="media-tags__list">
        {props.accounts.map(account => (
          <StyledTag key={account.id} className="media-tags__tag">
            { MediaUtil.socialIcon(`${account.provider}.com`) /* TODO: refactor */ }
            <a href={account.url} style={{ margin: `0 ${units(1)}` }} target="_blank" rel="noopener noreferrer">
              { account.embed.username || account.embed.url }
            </a>
          </StyledTag>))}
      </ul>
    </div>
  );
};

export default AccountChips;
