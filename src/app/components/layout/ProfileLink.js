import React from 'react';
import { Link } from 'react-router';

class ProfileLink extends React.Component {
  render() {
    const { user, className } = this.props;

    if (!user) { return null };

    let url = user.dbid ? `/check/user/${user.dbid}` : '';

    return url ?
        <Link to={url} className={className}>{user.name}</Link> :
        <span className={className}>{user.name}</span>;
  }
}

export default ProfileLink;
