var React = require('react')
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';
const muiTheme = getMuiTheme({
  palette: {
  },
});
 var AddProfileName = React.createClass({
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

     render: function() {
         return (
           <MuiThemeProvider muiTheme={muiTheme}>
           <div>
               <TextField floatingLabelText= "Name" value={this.state.textFieldValue} onChange={this._handleTextFieldChange} />
               <FlatButton
               label="Save"
               secondary={true}
               onTouchTap={this.handleTouchTap}
                />
           </div>
           </MuiThemeProvider>

         )
     }
})

module.exports = AddProfileName;
