it 'should search by keywords', bin4: true, quick: true do
  api_create_team_claims_sources_and_redirect_to_all_items({ count: 2 })
  sleep 60 # wait for the items to be indexed in Elasticsearch
  wait_for_selector('#search-input')
  expect(@driver.find_elements(:css, '.media__heading').size).to eq 2
  wait_for_selector('#search-input').send_keys(:control, 'a', :delete)
  wait_for_selector('#search-input').send_keys('Claim 0')
  @driver.action.send_keys(:enter).perform
  wait_for_selector('.medias__item')
  expect(@driver.find_elements(:css, '.media__heading').size).to eq 1

  # find all medias with an empty search
  @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items"
  wait_for_selector('#search-input')
  expect(@driver.find_elements(:css, '.media__heading').size).to eq 2
end
