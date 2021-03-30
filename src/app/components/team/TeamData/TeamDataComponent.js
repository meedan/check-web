import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import SettingsHeader from '../SettingsHeader';
import { ContentColumn } from '../../../styles/js/shared';

const TeamDataComponent = ({ dataReportUrl }) => (
  <ContentColumn large>
    <SettingsHeader
      title={
        <FormattedMessage
          id="teamDataComponent.title"
          defaultMessage="Workspace data"
        />
      }
      subtitle={
        <FormattedMessage
          id="teamDataComponent.subtitle"
          defaultMessage="Download data and metadata from Check. Get insight and analysis about workspace and tipline usage."
        />
      }
      helpUrl="https://help.checkmedia.org/en/articles/4511362"
    />
    <Card>
      <CardContent>
        { dataReportUrl ?
          <React.Fragment>
            <Typography variant="body1" component="p">
              <FormattedMessage id="teamDataComponent.notSet1" defaultMessage="Click the button below to open your data report in a new window." />
            </Typography>
            <Box mt={2} mb={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => { window.open(dataReportUrl); }}
              >
                <FormattedMessage id="teamDataComponent.viewDataReport" defaultMessage="View data report" />
              </Button>
            </Box>
            <Typography variant="body1" component="p">
              <FormattedMessage id="teamDataComponent.notSet2" defaultMessage="To request any customization of your data report, please reach out to support." />
            </Typography>
          </React.Fragment> :
          <React.Fragment>
            <Typography variant="body1" component="p">
              <FormattedMessage
                id="teamDataComponent.set1"
                defaultMessage="Fill {thisShortForm} to request access to your data report."
                values={{
                  thisShortForm: (
                    <a href="https://airtable.com/tblGZZSxt65YdczlG/viw2zt1Wkkxm69uQ4" target="_blank" rel="noopener noreferrer">
                      <FormattedMessage id="teamDataComponent.formLinkText" defaultMessage="this short form" />
                    </a>
                  ),
                }}
              />
            </Typography>
            <Typography variant="body1" component="p">
              <FormattedMessage id="teamDataComponent.set2" defaultMessage="Your data report will be enabled within one business day." />
            </Typography>
          </React.Fragment> }
      </CardContent>
    </Card>
  </ContentColumn>
);

TeamDataComponent.defaultProps = {
  dataReportUrl: null,
};

TeamDataComponent.propTypes = {
  dataReportUrl: PropTypes.string, // or null
};

export default TeamDataComponent;
