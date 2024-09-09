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
  ACADEMIC: <FormattedMessage defaultMessage="Academic" description="Feed license" id="checkFeedLicenses.licenseNameAcademic" />,
  COMMERCIAL: <FormattedMessage defaultMessage="Commercial" description="Feed license" id="checkFeedLicenses.licenseNameCommercial" />,
  OPEN_SOURCE: <FormattedMessage defaultMessage="Open Source" description="Feed license" id="checkFeedLicenses.licenseNameOpenSource" />,
}[licenseName]);
