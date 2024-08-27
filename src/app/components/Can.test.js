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
        permission="create Media"
        permissions='{"create Media":true}'
      >
        <Child />
      </Can>
    ));
    expect(wrapper.find(Child)).toHaveLength(1);
  });

  it('should not render child component if permission is not satisfied', () => {
    const wrapper = shallow((
      <Can
        permission="create Media"
        permissions='{"create Media":false}'
      >
        <Child />
      </Can>
    ));
    expect(wrapper.find(Child)).toHaveLength(0);
  });

  it('should render "otherwise" component if permission is not satisfied', () => {
    const wrapper = shallow((
      <Can
        otherwise={<Otherwise />}
        permission="create Media"
        permissions='{"create Media":false}'
      >
        <Child />
      </Can>
    ));
    expect(wrapper.find(Child)).toHaveLength(0);
    expect(wrapper.find(Otherwise)).toHaveLength(1);
  });
});
