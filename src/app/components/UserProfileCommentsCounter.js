var React = require('react')
class UserProfileCommentsCounter extends Component {
  render () {
    return(
      <div> <button type="button">Comments: {this.props.commentsCount}</button> </div>
    )
  }
})
export default UserProfileCommentsCounter;
