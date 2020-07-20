/* global describe, expect, it */
import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

import Annotation from './Annotation';

describe.skip('<Annotation />', () => {
  /* FIXME
    Test removed because it was adding no value here.
    It actually tested `TimeBefore` instead of `Annotation`, so I moved it to `TimeBefore.test.js`

    Pending Relay upgrade and hopefully a refactoring of `Annotation` into manageable
    pieces to be able to test it effectively.
  */

  it('should refactor Annotation', () => {});
});
