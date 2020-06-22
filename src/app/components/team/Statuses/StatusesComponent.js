import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import StatusListItem from './StatusListItem';
import EditStatusDialog from './EditStatusDialog';
import LanguageSwitcher from '../../LanguageSwitcher';


const StatusesComponent = (props) => {
  const { team } = props;
  const { statuses } = team.verification_statuses;
  const defaultLanguage = team.get_language || 'en';
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleChangeLanguage = (newValue) => {
    setCurrentLanguage(newValue);
  };

  return (
    <React.Fragment>
      <Card>
        <Button color="primary" variant="contained" onClick={() => setMenuOpen(true)}>
          <FormattedMessage
            id="statusesComponent.newStatus"
            defaultMessage="New status"
          />
        </Button>
        <LanguageSwitcher
          currentLanguage={currentLanguage}
          languages={languages}
          onChange={handleChangeLanguage}
        />
        <CardContent>
          <List>
            { statuses.map(s => (
              <StatusListItem key={s.id} status={s} />
            ))}
          </List>
        </CardContent>
      </Card>
      <EditStatusDialog open={menuOpen} />
    </React.Fragment>
  );
};

export default StatusesComponent;
