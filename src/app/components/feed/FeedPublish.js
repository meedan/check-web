import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Checkbox from '@material-ui/core/Checkbox';
import styles from './SaveFeed.module.css';
import ExternalLink from '../ExternalLink';
import Alert from '../cds/alerts-and-prompts/Alert';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import SchoolIcon from '../../icons/school.svg';
import CorporateFareIcon from '../../icons/corporate_fare.svg';
import OpenSourceIcon from '../../icons/open_source.svg';


const LicenseOption = ({
  icon,
  title,
  description,
  url,
  checked,
  onChange,
}) => (
  <div className={styles.licenseOption}>
    <Checkbox checked={checked} onChange={onChange} />
    <div className={`${styles.licenseOptionIcon} ${checked ? null : styles.licenseOptionDisabled}`}>
      {icon}
    </div>
    <div>
      <div className={`typography-subtitle2 ${checked ? null : styles.licenseOptionDisabled}`}>
        {title}
      </div>
      <span className={`typography-body2 ${checked ? styles.licenseOptionDescription : styles.licenseOptionDisabled}`}>
        {description}
        {url && (
          <>
            &nbsp;
            <ExternalLink url={url}>
              <FormattedMessage id="saveFeed.licenseDetails" defaultMessage="License details" description="Link to external page with license details" />
            </ExternalLink>
          </>
        )}
      </span>
    </div>
  </div>
);

const FeedPublish = ({
  discoverable,
  discoverableNoLicense,
  onToggleDiscoverable,
  academicLicense,
  commercialLicense,
  openSourceLicense,
  onToggleAcademic,
  onToggleCommercial,
  onToggleOpenSource,
}) => (
  <div className={styles.saveFeedCard}>
    <div className="typography-subtitle2">
      <FormattedHTMLMessage
        id="saveFeed.publishTitle"
        defaultMessage="Publish to Marketplace <small>(coming soon)</small>"
        description="Title of the section where the publishing preferences are set"
      />
    </div>
    <span className="typography-body2">
      <FormattedMessage
        id="saveFeed.publishBlurb"
        defaultMessage="Publish your feed to the marketplace to make it discoverable to third-party organizations, while keeping precise control over your assets."
        description="Helper text for the publish feed section"
      />
    </span>
    <SwitchComponent
      label={
        <FormattedMessage
          id="saveFeed.publishSwitch"
          defaultMessage="Publish shared feed to Marketplace"
          description="Label for a switch where the user publishes a feed"
        />
      }
      checked={discoverable}
      onChange={onToggleDiscoverable}
      disabled
    />
    { discoverable ?
      <div className={styles.licenseSection}>
        <div className="typography-subtitle2">
          <FormattedMessage
            id="saveFeed.licenseTitle"
            defaultMessage="License"
            description="Title of the section where the publishing preferences such as licenses are selected"
          />
        </div>
        {
          discoverableNoLicense && (
            <Alert
              id="feed-publish__no-license-error"
              title={
                <FormattedMessage
                  id="saveFeed.selectLicense"
                  defaultMessage="Select a license in order to create and publish this shared feed."
                  description="Error message that appears when a user has tried to submit a form without a legal (copyright) license chosen for their data."
                />
              }
              content={
                <ExternalLink
                  url="https://www.meedan.com" /* FIXME: Update url */
                  style={{ color: 'var(--errorSecondary)' }}
                >
                  <FormattedMessage
                    id="saveFeed.learnMoreLicenses"
                    defaultMessage="Learn more about licenses."
                    description="Link to an external page with more information about the data licenses"
                  />
                </ExternalLink>
              }
              variant="error"
            />
          )
        }
        <span className="typography-body2">
          <FormattedMessage
            id="saveFeed.licenseBlurb"
            defaultMessage="A license tells others what they can and can't do with your code."
            description="Helper text for the license section"
          />
          &nbsp;
          <ExternalLink url="https://www.meedan.com">{ /* FIXME: Update url */}
            <FormattedMessage
              id="saveFeed.learnMoreLicenses"
              defaultMessage="Learn more about licenses."
              description="Link to an external page with more information about the data licenses"
            />
          </ExternalLink>
        </span>
        <LicenseOption
          icon={<SchoolIcon />}
          title={<FormattedMessage
            id="saveFeed.licenseAcademic"
            defaultMessage="Academic"
            description="Label for the academic licensing of shared feed data"
          />}
          checked={academicLicense}
          onChange={onToggleAcademic}
          description="Permit the exploration of the data for noncommercial research intended for publication in an academic or other scholarly setting."
        />
        <LicenseOption
          icon={<CorporateFareIcon />}
          title={<FormattedMessage
            id="saveFeed.licenseCommercial"
            defaultMessage="Commercial"
            description="Label for the academic licensing of shared feed data"
          />}
          checked={commercialLicense}
          onChange={onToggleCommercial}
          description="Permit the use of the data for internal 3rd party business operations, internal research, and development efforts. "
        />
        <LicenseOption
          icon={<OpenSourceIcon />}
          title={<FormattedMessage
            id="saveFeed.licenseOpenSource"
            defaultMessage="Open source"
            description="Label for the academic licensing of shared feed data"
          />}
          checked={openSourceLicense}
          onChange={onToggleOpenSource}
          description="Permits free use and distribution of the data. Enables collaboration and adaptation for various purposes, including commercial uses."
        />
      </div>
      : null }
  </div>
);

export default FeedPublish;
