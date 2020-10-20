import React from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import UserAvatar from './UserAvatar';
import { black10, black54 } from '../styles/js/shared';

const StyledAvatars = styled.div`
  position: relative;
  display: flex;
  height: 24px;

  .avatar {
    position: absolute;
    top: 0;
  }
`;

const UserAvatars = (props) => {
  const { users, max } = props;

  const showMore = props.showMore || false;
  const maxNumberOfAvatars = max || 4;

  let width = 15 * (users.length + 1);
  if (maxNumberOfAvatars < users.length && showMore) {
    width = ((maxNumberOfAvatars + 1) * 15) + 100;
  }

  return (
    <Box clone width={width}>
      <StyledAvatars id="user__avatars">
        {users.slice(0, maxNumberOfAvatars).map((userNode, index) => {
          const user = userNode.node || userNode;
          return (
            <span title={user.name} key={user.name}>
              <Box clone display="inline-block" border={`1px solid ${black10}`} left={15 * index}>
                <UserAvatar
                  user={user}
                  size="extraSmall"
                />
              </Box>
            </span>
          );
        })}
        {' '}
        { (users.length > maxNumberOfAvatars && showMore) ?
          <Box position="absolute" left={maxNumberOfAvatars * 20} whiteSpace="nowrap" fontWeight="bold" color={black54} alignSelf="center">
            <FormattedMessage
              id="projectAssignment.more"
              defaultMessage="+{count} more"
              values={{
                count: users.length - maxNumberOfAvatars,
              }}
            />
          </Box> : null
        }
      </StyledAvatars>
    </Box>
  );
};

export default UserAvatars;
