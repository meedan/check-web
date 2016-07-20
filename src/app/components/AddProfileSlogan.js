import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';

const muiTheme = getMuiTheme({
  palette: {
  },
});
class AddProfileSlogan extends Component {

   getInitialState() {
         return {
             textFieldValue: ''
         };
     }

     _handleTextFieldChange(e) {
         this.setState({
             textFieldValue: e.target.value
         });
     }

  render () {
    return(
      <MuiThemeProvider muiTheme={muiTheme}>
      <div>

          <TextField floatingLabelText= "Slogan" value={this.state.textFieldValue} onChange={this._handleTextFieldChange} />


      </div>
      </MuiThemeProvider>    )
  }
})

export default AddProfileSlogan;
