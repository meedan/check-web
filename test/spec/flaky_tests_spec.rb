module FlakyTests
  require 'json'
  require 'aws-sdk-s3'

  KEY = if ENV['GITHUB_BRANCH'] == 'master'
          'flaky-tests/master.json'
        else
          'flaky-tests/develop.json'
        end

  def get_file_from_aws_bucket
    config = {
      endpoint: get_config('AWS_ENDPOINT'),
      access_key_id: get_config('AWS_ACCESS_KEY_ID'),
      secret_access_key: get_config('AWS_SECRET_ACCESS_KEY'),
      region: get_config('AWS_REGION')
    }
    client = Aws::S3::Client.new(config)
    s3 = Aws::S3::Resource.new(client: client)
    bucket_name = 'check-web-github'
    s3.bucket(bucket_name).object(KEY)
  end

  def update_flaky_tests_file(failing_tests)
    return if failing_tests.empty? || ENV['GITHUB_BRANCH'].nil?

    file = JSON.parse(get_file_from_aws_bucket.get.body.read)
    failing_tests.each do |key, value|
      test = {}
      if file.key? key
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
      create_file(file)
      upload_file_to_aws
    end
  end

  def create_file(tests)
    File.write('file.json', JSON.dump(tests))
  end

  def upload_file_to_aws
    get_file_from_aws_bucket.upload_file('file.json') if ENV['GITHUB_BRANCH'] == 'develop' || ENV['GITHUB_BRANCH'] == 'master'
  end
end
