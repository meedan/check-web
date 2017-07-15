import React from 'react';

class ProfileLink extends React.Component {
  render() {
    const user = this.props.user;

    let url = user.email ? 'mailto:' + user.email : '';

    if (user && user.source && user.source.accounts && user.source.accounts.edges && user.source.accounts.edges.length > 0){
      url = user.source.accounts.edges[0].node.url;
    }

    return url ? <a target="_blank" rel="noopener noreferrer" href={url}>{user.name}</a> : user.name;
  }
}

export default ProfileLink;
