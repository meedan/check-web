import React from 'react';
import { mountWithIntl } from './helpers/intl-test';

import Can from '../../src/app/components/Can';

describe('<Can />', () => {
  it('should render child component if permission is satisfied', function() {
    const wrapper = mountWithIntl(<Can permissions='{"create Media":true}' permission='create Media' children={<div id='child'></div>} />);
    expect(wrapper.find('#child')).toHaveLength(1);
  });

  it('should not render child component if permission is not satisfied', function() {
    const wrapper = mountWithIntl(<Can permissions='{"create Media":false}' permission='create Media' children={<div id='child'></div>} />);
    expect(wrapper.find('#child')).toHaveLength(0);
  });

  it('should render "otherwise" component if permission is not satisfied', function() {
    const wrapper = mountWithIntl(
      <Can
        permissions='{"create Media":false}'
        permission='create Media'
        children={<div id='child'></div>}
        otherwise={<div id='otherwise'></div>}
      />);
    expect(wrapper.find('#child')).toHaveLength(0);
    expect(wrapper.find('#otherwise')).toHaveLength(1);
  });
});
