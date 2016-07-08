var React = require('react')
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';

const muiTheme = getMuiTheme({
  palette: {
  },
});
 var AddProfileSlogan = React.createClass({
   getInitialState: function() {
         return {
             textFieldValue: ''
         };
     },

     _handleTextFieldChange: function(e) {
         this.setState({
             textFieldValue: e.target.value
         });
     },

  render: function () {
    return(
      <MuiThemeProvider muiTheme={muiTheme}>
      <div>
      
          <TextField floatingLabelText= "Slogan" value={this.state.textFieldValue} onChange={this._handleTextFieldChange} />


      </div>
      </MuiThemeProvider>    )
  }
})

module.exports = AddProfileSlogan;
