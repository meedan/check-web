import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import SettingSwitch from './SettingSwitch';
import ThresholdControl from './ThresholdControl';
import SettingsHeader from '../SettingsHeader';
import { ContentColumn } from '../../../styles/js/shared';

const SimilarityComponent = ({ team }) => {
  console.log('team', team);

  return (
    <React.Fragment>
      <ContentColumn large>
        <SettingsHeader
          title={
            <FormattedMessage
              id="similarityComponent.title"
              defaultMessage="Similarity matching"
              description="Title to similarity matching settings page"
            />
          }
          subtitle={
            <FormattedMessage
              id="similarityComponent.blurb"
              defaultMessage="Automatically group items together if they are similar."
              description="Subtitle to similarity matching settings page"
            />
          }
          helpUrl="https://help.checkmedia.org/en/articles/4285291-content-language" // FIXME add correct KB url
        />
        <Card>
          <CardContent>
            <SettingSwitch
              checked
              onChange={() => {}}
              label={
                <FormattedMessage
                  id="similarityComponent.masterSwitchLabel"
                  defaultMessage="Automated matching if OFF" // TODO: This copy looks weird, validate it
                />
              }
            />
          </CardContent>
        </Card>
        { /* FIXME: Show card below only for Check superadmins */ }
        <SettingsHeader
          title={
            <FormattedMessage
              id="similarityComponent.titleInternal"
              defaultMessage="Internal settings"
              description="Title to similarity matching page, Meedan restricted settings"
            />
          }
          subtitle={
            <FormattedMessage
              id="similarityComponent.blurbInternal"
              defaultMessage="Meedan employees see these settings, but users don't."
              description="Subtitle to similarity matching page, Meedan restricted settings"
            />
          }
        />
        <Card>
          { /* TODO: Validate if worthy localizing internal settings */ }
          <CardContent>
            <Box mb={4}>
              <SettingSwitch
                checked
                onChange={() => {}}
                label="Elastic search"
                explainer="ElasticSearch is meant for sintatic matching. It finds sentences that are written in a similar way, even if their meanings differ."
              />
              <ThresholdControl type="matching" />
              <ThresholdControl type="suggestion" />
            </Box>
            <Box mb={4}>
              <SettingSwitch
                checked
                onChange={() => {}}
                label="Vector model"
                explainer="Allow for cross lingual matches as well as deeper semantic matches that ElasticSearch may not catch directly."
              />
              <ThresholdControl type="matching" />
              <ThresholdControl type="suggestion" />
            </Box>
            <Box mb={4}>
              <SettingSwitch
                checked
                onChange={() => {}}
                label="Image matching"
              />
              <ThresholdControl type="matching" />
              <ThresholdControl type="suggestion" />
            </Box>
          </CardContent>
        </Card>
      </ContentColumn>
    </React.Fragment>
  );
};

SimilarityComponent.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(SimilarityComponent, graphql`
  fragment SimilarityComponent_team on Team {
    id
    name
  }
`);
