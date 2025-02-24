import React from 'react';
import { graphql, QueryRenderer } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { injectIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import Loader from './cds/loading/Loader';
import ErrorBoundary from './error/ErrorBoundary';
import UserTosComponent from './UserTosComponent';
import dialogStyles from '../styles/css/dialog.module.css';


const UserTos = ({ user }) => {
  // Fix: remove debug and add back !user.accepted_terms
  const [openDialog, setOpenDialog] = React.useState(user && user.dbid && user.accepted_terms);
  return (
    <Dialog className={dialogStyles['dialog-window']} open={openDialog}>
      <ErrorBoundary component="UserTos">
        <QueryRenderer
          environment={Relay.Store}
          query={graphql`
            query UserTosQuery {
              about{
                ...UserTosComponent_about
              }
            }
          `}
          render={({ error, props }) => {
            if (!error && props) {
              return <UserTosComponent about={props.about} setOpenDialog={setOpenDialog} user={user} />;
            }
            return <Loader size="large" theme="white" variant="page" />;
          }}
        />
      </ErrorBoundary>
    </Dialog>
  );
};

export default injectIntl(UserTos);
