var React = require('react')
var UserProfileViewsCounter = require('./UserProfileViewsCounter')
var UserProfileFollowersCounter = require('./UserProfileFollowersCounter')
var UserProfileCommentsCounter = require('./UserProfileCommentsCounter')
class UserProfileStates extends Component {

  render () {
    return(
    <div>
      <UserProfileViewsCounter viewsCount='120'/>
      <UserProfileFollowersCounter followersCount='392'/>
      <UserProfileCommentsCounter commentsCount='8'/>
    </div>
    )
  }
})
export default UserProfileStates;
