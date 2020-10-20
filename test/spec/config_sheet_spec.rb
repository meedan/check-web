module Spreadsheet
  require "google/apis/sheets_v4"
  require "googleauth"
  require "googleauth/stores/file_token_store"
  require "fileutils"
  require 'json'
  extend self

  OOB_URI = "urn:ietf:wg:oauth:2.0:oob".freeze
  # APPLICATION_NAME = "Google Sheets API Ruby Quickstart".freeze
  APPLICATION_NAME = "quickstart".freeze
  CREDENTIALS_PATH = "/app/test/spec/credentials.json".freeze
  # The file token.yaml stores the user's access and refresh tokens, and is
  # created automatically when the authorization flow completes for the first
  # time.
  TOKEN_PATH = "token.yaml".freeze
  SCOPE = Google::Apis::SheetsV4::AUTH_SPREADSHEETS

  def authorize
    client_id = Google::Auth::ClientId.from_file CREDENTIALS_PATH
    token_store = Google::Auth::Stores::FileTokenStore.new file: TOKEN_PATH
    authorizer = Google::Auth::UserAuthorizer.new client_id, SCOPE, token_store
    user_id = "default"
    credentials = authorizer.get_credentials user_id
    if credentials.nil?
      url = authorizer.get_authorization_url base_url: OOB_URI
      puts "Open the following URL in the browser and enter the " \
          "resulting code after authorization:\n" + url
      code = gets
      credentials = authorizer.get_and_store_credentials_from_code(
        user_id: user_id, code: code, base_url: OOB_URI
      )
    end
    credentials
  end

  # Initialize the API
  @service = Google::Apis::SheetsV4::SheetsService.new
  @service.client_options.application_name = APPLICATION_NAME
  @service.authorization = authorize
  @spreadsheet_id = "1hDRAHPaVaiBfDoQHQmEDl2J3HR3S0dOl-hjTOf8NeBg"

  def read_spreadsheet
    flakies = {}
    response = @service.get_spreadsheet_values @spreadsheet_id, 'A2:D'
    puts "No data found." if response.values.empty?
    response.values.each do |row|
      flaky= {}
      flaky['failure'] = row[1]
      flaky['total_failure'] = row[2]
      flakies[row[0]] = flaky
    end
    flakies
  end

  # values = [["1", "2", "3", "4"]] #colum
  # values = [["5"], ["6"], ["3"], ["4"]] #line

  def update_data(flakies)
    colum1, colum2, colum3 = [],[],[]
    c1, c2, c3 = [], [] , []
    flakies.each do |f,k|
      c1.push(f)
      c2.push(k['failure'].to_i)
      c3.push(k['total_failure'].to_i)
      colum1.push(c1)
      colum2.push(c2)
      colum3.push(c3)
      c1, c2, c3 = [], [] , []
    end

    @data = [
      {
        range:  "A2",
        values: colum1
      },
      {
        range:  "B2",
        values: colum2
      },
      {
        range:  "C2",
        values: colum3
      }
    ]
  end

  def update_spreadsheet(tests={})
    flaky = {}
    unless tests.empty?
      flakies = read_spreadsheet
      tests.each do |key, value|
        if flakies.has_key? key
          flakies[key]['total_failure'] = flakies[key]['total_failure'].to_i + 1
        else
          flaky['failure'] = value
          flaky['total_failure'] = 0
          flakies[key] = flaky
          flaky= {}
        end
      end
      update_data(flakies)
      batch_update_values = Google::Apis::SheetsV4::BatchUpdateValuesRequest.new( data:@data, value_input_option: 'RAW' )
      result = @service.batch_update_values(@spreadsheet_id, batch_update_values)
      puts "#{result.total_updated_cells} cells updated."
    end
  end

  tests = {}
  tests['a'] = 1
  tests['b'] = 2
  tests['c'] = 3
  tests['d'] = 4

  update_spreadsheet(tests)
end