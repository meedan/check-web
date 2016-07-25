import React, { Component, PropTypes } from 'react';
import UserProfileBasicInfo from './UserProfileBasicInfo'
import AnnotationsListView from './AnnotationsListView'
import source from './Data_Source'
import {Tabs, Tab} from 'material-ui/lib/Tabs';
 var injectTapEventPlugin = require("react-tap-event-plugin");
 injectTapEventPlugin();

class UserProfileViewer extends Component {
  constructor(props) {
     super(props);
     this.state = {
       value: 'a',
     };
   }

   handleChange = (value) => {
     this.setState({
       value: value,
     });
   };

   render() {
     return (
       <div>
       <UserProfileBasicInfo source={source}/>

         <Tabs

         >
           <Tab label="Annotations"  >
             <div>
                <AnnotationsListView annotations={source.annotations} />
             </div>
           </Tab>
           <Tab label="Tab B" >
             <div>
                <p>
                 This is another example of a controllable tab. Remember, if you
                 use controllable Tabs, you need to give all of your tabs values or else
                 you wont be able to select them.
               </p>
             </div>
           </Tab>
         </Tabs>
        </div>
     );
   }
}
export default UserProfileViewer;
