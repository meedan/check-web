/* global describe, expect, it */
import React from 'react';
import { shallow } from 'enzyme';

import Can from './Can';

function Child() {
  return <React.Fragment />;
}

function Otherwise() {
  return <React.Fragment />;
}

describe('<Can />', () => {
  it('should render child component if permission is satisfied', () => {
    const wrapper = shallow((
      <Can
        permissions='{"create Media":true}'
        permission="create Media"
      >
        <Child />
      </Can>
    ));
    expect(wrapper.find(Child)).toHaveLength(1);
  });

  it('should not render child component if permission is not satisfied', () => {
    const wrapper = shallow((
      <Can
        permissions='{"create Media":false}'
        permission="create Media"
      >
        <Child />
      </Can>
    ));
    expect(wrapper.find(Child)).toHaveLength(0);
  });

  it('should render "otherwise" component if permission is not satisfied', () => {
    const wrapper = shallow((
      <Can
        permissions='{"create Media":false}'
        permission="create Media"
        otherwise={<Otherwise />}
      >
        <Child />
      </Can>
    ));
    expect(wrapper.find(Child)).toHaveLength(0);
    expect(wrapper.find(Otherwise)).toHaveLength(1);
  });
});
