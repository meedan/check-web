var React = require('react')
var TwitterAccountIconButton = require('./TwitterAccountIconButton')
var FacebookAccountIconButton = require('./FacebookAccountIconButton')
class UserProfileAccountsList extends Component {
  render() {
    return(
    <div><TwitterAccountIconButton/><FacebookAccountIconButton/></div>
    )
  }
})
export default UserProfileAccountsList;
