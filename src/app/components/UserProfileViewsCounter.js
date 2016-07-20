var React = require('react')
class UserProfileViewsCounter extends Component {

  render () {
    return(
      <div> <button type="button">Views: {this.props.viewsCount}</button> </div>
    )
  }
})
export default UserProfileViewsCounter;
