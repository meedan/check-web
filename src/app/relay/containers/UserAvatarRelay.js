import React from 'react';
import Relay from 'react-relay';
import styled from 'styled-components';
import MeRoute from '../MeRoute';
import UserAvatar from '../../components/UserAvatar';
import userFragment from '../userFragment';
import { Pulse, white, avatarSize } from '../../styles/js/shared';

const StyledAvatarLoader = styled(Pulse)`
  background-color: ${white};
  width: ${avatarSize}px;
  height: ${avatarSize}px;
  border-radius: 50%;
  flex: 0 0 auto;
`;

const UserAvatarRelay = (props) => {
  const UserAvatarContainer = Relay.createContainer(UserAvatar, {
    fragments: {
      user: () => userFragment,
    },
  });

  const route = new MeRoute();
  return (
    <Relay.RootContainer
      Component={UserAvatarContainer}
      route={route}
      renderLoading={() => <StyledAvatarLoader />}
      renderFetched={data => <UserAvatarContainer {...props} {...data} />}
    />
  );
};

export default UserAvatarRelay;
