import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import QuickFilterMenu from './QuickFilterMenu';

describe('<QuickFilterMenu />', () => {
  const setTeamFilters = jest.fn();
  it('should render QuickFilterMenu component', () => {
    const quickFilterMenuComponent = mountWithIntlProvider((
      <QuickFilterMenu
        setTeamFilters={setTeamFilters}
        currentOrg={{}}
        teamsWithoutCurrentOrg={[]}
      />
    ));

    const quickFilterMenu = quickFilterMenuComponent.find('.quick-filter-menu');
    expect(quickFilterMenu).toHaveLength(1);
  });

  it('should filter for the current workspace', () => {
    const quickFilterMenuComponent = mountWithIntlProvider((
      <QuickFilterMenu
        setTeamFilters={setTeamFilters}
        currentOrg={{ dbid: 1 }}
        teamsWithoutCurrentOrg={[
          { node: { dbid: 2 } },
          { node: { dbid: 3 } },
          { node: { dbid: 4 } },
        ]}
      />
    ));

    // open the menu
    const menuButton = quickFilterMenuComponent.find('#int-quick-filter-menu__button--open');
    expect(menuButton).toHaveLength(1);
    menuButton.at(0).simulate('click');

    // click the button to filter for only current workspace
    const myWorkspaceButton = quickFilterMenuComponent.find('li#int-quick-filter-menu__menu-item--my-workspace');
    expect(myWorkspaceButton).toHaveLength(1);
    myWorkspaceButton.at(0).simulate('click');
    expect(setTeamFilters).toHaveBeenCalledWith([1]);
  });

  it('should filter for other workspaces', () => {
    const quickFilterMenuComponent = mountWithIntlProvider((
      <QuickFilterMenu
        setTeamFilters={setTeamFilters}
        currentOrg={{ dbid: 1 }}
        teamsWithoutCurrentOrg={[
          { node: { dbid: 2 } },
          { node: { dbid: 3 } },
          { node: { dbid: 4 } },
        ]}
      />
    ));

    // open the menu
    const menuButton = quickFilterMenuComponent.find('#int-quick-filter-menu__button--open');
    expect(menuButton).toHaveLength(1);
    menuButton.at(0).simulate('click');

    // click the button to filter for only current workspace
    const myWorkspaceButton = quickFilterMenuComponent.find('li#int-quick-filter-menu__menu-item--other-workspaces');
    expect(myWorkspaceButton).toHaveLength(1);
    myWorkspaceButton.at(0).simulate('click');
    expect(setTeamFilters).toHaveBeenCalledWith([2, 3, 4]);
  });
});
