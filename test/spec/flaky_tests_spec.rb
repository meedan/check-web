module FlakyTests
  require 'json'
  require 'aws-sdk-s3'

  def get_file
    config = {
      endpoint: @config['aws_endpoint'],
      access_key_id: @config['aws_access_key_id'],
      secret_access_key: @config['aws_secret_access_key'],
      region: @config['aws_region']
    }
    client = Aws::S3::Client.new(config)
    s3 = Aws::S3::Resource.new(client:client)
    bucket_name = 'check-web-travis'
    current_branch = ENV['TRAVIS_BRANCH']
    if current_branch == "master"
      key = 'flaky-tests/master.json'
    else
      key = 'flaky-tests/develop.json'
    end
    file = s3.bucket(bucket_name).object(key)
  end

  def update_failing_tests_file(failing_tests)
    unless failing_tests.empty?
      file = JSON.parse(get_file.get.body.read)
      failing_tests.each do |key,value|
        test = {}
        if file.has_key? key
          if value['failures'].to_i < 3
            file[key]['flaky_failures'] = file[key]['flaky_failures'].to_i + 1
          else
            file[key]['legit_failures'] = file[key]['legit_failures'].to_i + 1
          end
          file[key]['last_failure'] = Time.new
          file[key]['imgur'] = value['imgur']
        else
          if value['failures'].to_i < 3
            test['flaky_failures'] = 1
            test['legit_failures'] = 0
          else
            test['flaky_failures'] = 0
            test['legit_failures'] = 1
          end
          test['imgur'] = value['imgur']
          test['last_failure'] = Time.new
          file[key] = test
        end
      end
      create_file(file)
      puts "Flaky Tests: #{file}"
      get_file.upload_file('file.json')
    end
  end

  def create_file(tests)
    File.write('file.json', JSON.dump(tests))
  end
end