import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import SettingsHeader from '../SettingsHeader';
import { ContentColumn } from '../../../styles/js/shared';

const useStyles = makeStyles({
  container: {
    maxHeight: 720,
  },
});

const TeamDataComponent = ({ data }) => {
  const classes = useStyles();

  const headers = data ? Object.keys(data[0]).filter(header => !['ID', 'Org'].includes(header)) : null;

  return (
    <ContentColumn large>
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamDataComponent.title"
            defaultMessage="Workspace data"
            description="Header for the stored data page of the current team"
          />
        }
        subtitle={
          <FormattedMessage
            id="teamDataComponent.subtitle"
            defaultMessage="Get insight and analysis about workspace and tipline usage."
          />
        }
        helpUrl="https://help.checkmedia.org/en/articles/4511362"
      />
      <Card>
        <CardContent>
          { data ?
            <TableContainer className={classes.container}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {headers.map(header => <TableCell key={header}>{header}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map(row => (
                    <TableRow>
                      {headers.map(header => <TableCell key={row.ID}>{row[header]}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer> :
            <React.Fragment>
              <Typography variant="body1" component="p" paragraph>
                <FormattedMessage
                  id="teamDataComponent.set1"
                  defaultMessage="Fill {thisShortForm} to request access to your data report."
                  values={{
                    thisShortForm: (
                      <a href="https://airtable.com/shrWpaztZ2SzD5TrA" target="_blank" rel="noopener noreferrer">
                        <FormattedMessage id="teamDataComponent.formLinkText" defaultMessage="this short form" />
                      </a>
                    ),
                  }}
                />
              </Typography>
              <Typography variant="body1" component="p" paragraph>
                <FormattedMessage id="teamDataComponent.set2" defaultMessage="Your data report will be enabled within one business day." />
              </Typography>
            </React.Fragment> }
        </CardContent>
      </Card>
    </ContentColumn>
  );
};

TeamDataComponent.defaultProps = {
  data: null,
};

TeamDataComponent.propTypes = {
  data: PropTypes.object, // or null
};

export default TeamDataComponent;
