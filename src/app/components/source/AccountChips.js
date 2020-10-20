import React from 'react';
import styled from 'styled-components';
import Box from '@material-ui/core/Box';
import SocialIcon from '../SocialIcon';
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
            <SocialIcon domain={account.provider} />
            <Box clone m={`0 ${units(1)}`}>
              <a href={account.url} target="_blank" rel="noopener noreferrer">
                { account.metadata.username || account.metadata.url }
              </a>
            </Box>
          </StyledTag>))}
      </ul>
    </div>
  );
};

export default AccountChips;
