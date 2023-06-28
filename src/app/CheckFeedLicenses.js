import React from 'react';
import { FormattedMessage } from 'react-intl';
import SchoolIcon from './icons/school.svg';
import CorporateFareIcon from './icons/corporate_fare.svg';
import OpenSourceIcon from './icons/open_source.svg';

const CheckFeedLicenses = {
  ACADEMIC: 1,
  COMMERCIAL: 2,
  OPEN_SOURCE: 3,
};

// Returns 'ACADEMIC', 'COMMERCIAL', 'OPEN_SOURCE' or 'UNKNOWN'
export const getLicenseName = (licenseId) => {
  let name = 'UNKNOWN';
  Object.keys(CheckFeedLicenses).forEach((licenseName) => {
    if (licenseId === CheckFeedLicenses[licenseName]) {
      name = licenseName;
    }
  });
  return name;
};

export const getLicenseIcon = licenseName => ({
  ACADEMIC: <SchoolIcon />,
  COMMERCIAL: <CorporateFareIcon />,
  OPEN_SOURCE: <OpenSourceIcon />,
}[licenseName]);

export const getLicenseTranslatedName = licenseName => ({
  ACADEMIC: <FormattedMessage id="checkFeedLicenses.licenseNameAcademic" defaultMessage="Academic" description="Feed license" />,
  COMMERCIAL: <FormattedMessage id="checkFeedLicenses.licenseNameCommercial" defaultMessage="Commercial" description="Feed license" />,
  OPEN_SOURCE: <FormattedMessage id="checkFeedLicenses.licenseNameOpenSource" defaultMessage="Open Source" description="Feed license" />,
}[licenseName]);
