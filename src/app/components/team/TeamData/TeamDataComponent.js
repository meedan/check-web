import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cx from 'classnames/bind';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import HelpIcon from '../../../icons/help.svg';
import GetAppIcon from '../../../icons/file_download.svg';
import SettingsHeader from '../SettingsHeader';
import LanguagePickerSelect from '../../cds/inputs/LanguagePickerSelect';
import { ContentColumn } from '../../../styles/js/shared';
import settingsStyles from '../Settings.module.css';

const useStyles = makeStyles(theme => ({
  container: {
    maxHeight: 720,
  },
  dropDowns: {
    gap: `${theme.spacing(2)}px`,
  },
  tableCell: {
    whiteSpace: 'nowrap',
  },
  helpIcon: {
    marginLeft: theme.spacing(1),
    color: 'var(--textSecondary)',
    cursor: 'help',
  },
  typographyButton: {
    fontSize: 14,
    textTransform: 'none',
  },
  typographyBody1: {
    fontSize: 14,
  },
  sticky: {
    position: 'sticky',
    left: 0,
    background: 'var(--otherWhite)',
  },
  stickyHeader: {
    position: 'sticky',
    left: 0,
    background: 'var(--otherWhite)',
    zIndex: '9999',
  },
}));

const messagesDescription = 'Explanation on table header, when hovering the "help" icon, on data settings page';
const messages = defineMessages({
  uniqueUsers: {
    id: 'teamDataComponent.uniqueUsers',
    defaultMessage: 'Unique users who interacted with the bot.',
    description: messagesDescription,
  },
  returningUsers: {
    id: 'teamDataComponent.returningUsers',
    defaultMessage: 'Unique users who had at least one session in the current month, and at least one session in the last previous two months.',
    description: messagesDescription,
  },
  publishedReports: {
    id: 'teamDataComponent.publishedReports',
    defaultMessage: 'Published reports created in Check or imported into Check (for all platforms).',
    description: messagesDescription,
  },
  reportsSent: {
    id: 'teamDataComponent.reportsSent',
    defaultMessage: 'Reports sent in response to requests. For example, if two users requested the same claim and received the same report, it counts as two.',
    description: messagesDescription,
  },
  uniqueUsersWhoReceivedReport: {
    id: 'teamDataComponent.uniqueUsersWhoReceivedReport',
    defaultMessage: 'Unique users who received a report. For example, if one user received three reports, it counts as one.',
    description: messagesDescription,
  },
  responseTime: {
    id: 'teamDataComponent.responseTime',
    defaultMessage: 'Average time between a user request and a report sent.',
    description: messagesDescription,
  },
  uniqueNewslettersSent: {
    id: 'teamDataComponent.uniqueNewslettersSent',
    defaultMessage: 'Unique newsletters sent, for all platforms.',
    description: messagesDescription,
  },
  newsletterSubscriptions: {
    id: 'teamDataComponent.newsletterSubscriptions',
    defaultMessage: 'Newsletter subscriptions.',
    description: messagesDescription,
  },
  newsletterCancellations: {
    id: 'teamDataComponent.newsletterCancellations',
    defaultMessage: 'Newsletter cancellations.',
    description: messagesDescription,
  },
  currentSubscribers: {
    id: 'teamDataComponent.currentSubscribers',
    defaultMessage: 'Current number of newsletter subscriptions.',
    description: messagesDescription,
  },
  newslettersDelivered: {
    id: 'teamDataComponent.newslettersDelivered',
    defaultMessage: 'Number of newsletters successfully delivered to subscribers, accounting for user errors.',
    description: messagesDescription,
  },
  whatsappConversations: {
    id: 'teamDataComponent.whatsappConversations',
    defaultMessage: 'Conversations are 24-hour message threads between you and your users. They are opened when messages sent by Check to users are delivered.',
    description: messagesDescription,
  },
  positiveSearches: {
    id: 'teamDataComponent.positiveSearches',
    defaultMessage: 'Number of user searches that returned at least one report.',
    description: messagesDescription,
  },
  negativeSearches: {
    id: 'teamDataComponent.negativeSearches',
    defaultMessage: 'Number of user searches that did not return a report.',
    description: messagesDescription,
  },
  newslettersSent: {
    id: 'teamDataComponent.newslettersSent',
    defaultMessage: 'The total number of newsletters sent to subscribers.',
    description: messagesDescription,
  },
});

function descendingComparator(a, b, orderBy) {
  let value1 = a[orderBy];
  let value2 = b[orderBy];
  // Special case for months
  if (orderBy === 'Month') {
    const convertMonthToNumber = value => (parseInt(value.replace(/^([0-9]+)\..*/, '$1'), 10));
    value1 = convertMonthToNumber(a[orderBy]);
    value2 = convertMonthToNumber(b[orderBy]);
  }
  if (value2 < value1) {
    return -1;
  }
  if (value2 > value1) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function formatValue(header, value) {
  let formattedValue = value;
  if (header === 'Month') {
    formattedValue = value.replace(/^[0-9]+\. /, '');
  }
  return formattedValue;
}

const TeamDataComponent = ({
  intl,
  slug,
  data,
  defaultLanguage,
}) => {
  const classes = useStyles();
  const defaultOrder = 'Month';
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState(defaultOrder);

  const headers = data ? Object.keys(data[0]).filter(header => !['ID', 'Org', 'Language', 'Platform'].includes(header)) : null;

  const languages = [];
  const platforms = [];
  if (data) {
    data.forEach((row) => {
      if (platforms.indexOf(row.Platform) === -1) {
        platforms.push(row.Platform);
      }
      if (languages.indexOf(row.Language) === -1) {
        languages.push(row.Language);
      }
    });
  }
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage || languages[0]);
  const [currentPlatform, setCurrentPlatform] = React.useState(platforms[0]);

  const helpMessages = {
    'WhatsApp conversations': intl.formatMessage(messages.whatsappConversations),
    'Unique users': intl.formatMessage(messages.uniqueUsers),
    'Returning users': intl.formatMessage(messages.returningUsers),
    'Published reports': intl.formatMessage(messages.publishedReports),
    'Reports sent to users': intl.formatMessage(messages.reportsSent),
    'Unique users who received a report': intl.formatMessage(messages.uniqueUsersWhoReceivedReport),
    'Average (median) response time': intl.formatMessage(messages.responseTime),
    'Unique newsletters sent': intl.formatMessage(messages.uniqueNewslettersSent),
    'Newsletter subscriptions': intl.formatMessage(messages.newsletterSubscriptions),
    'Newsletter cancellations': intl.formatMessage(messages.newsletterCancellations),
    'Current subscribers': intl.formatMessage(messages.currentSubscribers),
    'Total newsletters delivered': intl.formatMessage(messages.newslettersDelivered),
    'Positive searches': intl.formatMessage(messages.positiveSearches),
    'Negative searches': intl.formatMessage(messages.negativeSearches),
    'Total newsletters sent': intl.formatMessage(messages.newslettersSent),
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = property => (event) => {
    handleRequestSort(event, property);
  };

  let rows = [];
  if (data) {
    rows = stableSort(data.filter(row => row.Language === currentLanguage && row.Platform === currentPlatform), getComparator(order, orderBy));
  }

  const handleDownload = () => {
    const csv = [headers.join(',')];

    rows.forEach((row) => {
      const csvRow = [];
      headers.forEach((header) => {
        csvRow.push(formatValue(header, row[header]));
      });
      csv.push(csvRow.join(','));
    });

    // Create a blob
    const blob = new Blob([csv.join('\r\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Create a link to download it
    const pom = document.createElement('a');
    pom.href = url;
    pom.setAttribute('download', `data-report-${slug}-${currentPlatform.toLowerCase()}-${currentLanguage}-${new Date().toISOString().split('T')[0]}.csv`);
    pom.click();
  };

  return (
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamDataComponent.title"
            defaultMessage="Tipline engagement data"
            description="Header for the stored data page of the current team"
          />
        }
        extra={(platforms.length > 1 || languages.length > 1) &&
          <Box display="flex" className={classes.dropDowns}>
            <FormControl variant="outlined">
              { platforms.length > 1 ?
                <Select value={currentPlatform} onChange={(e) => { setCurrentPlatform(e.target.value); }} margin="dense">
                  {platforms.map(platform => (
                    <MenuItem value={platform} key={platform}>{platform}</MenuItem>
                  ))}
                </Select> : null }
            </FormControl>
            { languages.length > 1 ?
              <LanguagePickerSelect
                selectedLanguage={currentLanguage}
                onSubmit={newValue => setCurrentLanguage(newValue.languageCode)}
                languages={languages}
                showLabel={false}
              /> : null
            }
          </Box>
        }
        actionButton={
          <ButtonMain
            variant="contained"
            theme="brand"
            size="default"
            iconLeft={<GetAppIcon />}
            onClick={handleDownload}
            label={
              <FormattedMessage
                id="teamDataComponent.download"
                defaultMessage="Download CSV"
                description="Label for action button displayed on workspace data report page."
              />
            }
          />
        }
        context={
          <FormattedHTMLMessage
            id="teamDataComponent.helpContext"
            defaultMessage='View and export monthly tipline usage data. Data may take 24 hours to update; all data except for WhatsApp conversations are specific to each tipline language. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about engagement data</a>.'
            values={{ helpLink: 'https://help.checkmedia.org/en/articles/4511362' }}
            description="Context description for the functionality of this page"
          />
        }
      />
      { data ?
        <ContentColumn remainingWidth>
          <Card>
            <CardContent>
              <TableContainer className={[classes.container, 'team-data-component__with-data'].join(' ')}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {headers.map(header => (
                        <TableCell key={header} className={[classes.tableCell, header === 'Month' ? classes.stickyHeader : ''].join(' ')} sortDirection={orderBy === header ? order : false}>
                          <TableSortLabel active={orderBy === header} direction={orderBy === header ? order : 'asc'} onClick={createSortHandler(header)}>
                            <Box display="flex" alignItems="center">
                              <Typography variant="button" className={classes.typographyButton}>
                                {header}
                              </Typography>
                              {' '}
                              { helpMessages[header] ?
                                <Tooltip key={header} title={helpMessages[header]} arrow>
                                  <span>
                                    <HelpIcon fontSize="small" className={classes.helpIcon} />
                                  </span>
                                </Tooltip> : null }
                            </Box>
                          </TableSortLabel>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.ID}>
                        {headers.map(header => (
                          <TableCell key={`${row.ID}-${header}`} className={[classes.tableCell, header === 'Month' ? classes.sticky : ''].join(' ')}>
                            <Typography variant="body1" className={classes.typographyBody1}>
                              {formatValue(header, row[header])}
                            </Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </ContentColumn> :
        <div className={cx(settingsStyles['setting-details-wrapper'])}>
          <div className={cx(settingsStyles['setting-content-container'], 'team-data-component__no-data')}>
            <p className="typography-body1">
              <FormattedMessage
                id="teamDataComponent.set1"
                defaultMessage="Fill {thisShortForm} to request access to your data report."
                description="Paragraph text informing the user what they need to do to enable this feature"
                values={{
                  thisShortForm: (
                    <a href="https://airtable.com/shrWpaztZ2SzD5TrA" target="_blank" rel="noopener noreferrer">
                      <FormattedMessage
                        id="teamDataComponent.formLinkText"
                        defaultMessage="this short form"
                        description="Link text taking the user to a form to fill out in order to request this feature be enabled"
                      />
                    </a>
                  ),
                }}
              />
            </p>
            <span className="typography-body1">
              <FormattedMessage
                id="teamDataComponent.set2"
                defaultMessage="Your data report will be enabled within one business day."
                description="Informational message to let the user know when their report will be available to view"
              />
            </span>
          </div>
        </div>
      }
    </>
  );
};

TeamDataComponent.defaultProps = {
  data: null,
  defaultLanguage: null,
};

TeamDataComponent.propTypes = {
  slug: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object), // or null
  defaultLanguage: PropTypes.string, // or null
  intl: intlShape.isRequired,
};

export default injectIntl(TeamDataComponent);
