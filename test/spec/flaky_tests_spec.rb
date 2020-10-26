module FlakyTests
  require 'json'
  require 'aws-sdk-s3'

  config = {
    endpoint: 'http://s3.eu-west-1.amazonaws.com',
    access_key_id: '',
    secret_access_key: '',
    region: 'eu-west-1'
  }
  @client = Aws::S3::Client.new(config)
  @s3 = Aws::S3::Resource.new(client: @client)
  @bucket_name = 'check-web-travis'
  @key = 'file.json'
  @file = @s3.bucket(@bucket_name).object(@key)

  def self.read_file
    response = @file.get.body.read
    tests = {}
    test = {}
    response.split(/},"/).each do |r|
      test_name,params = r.split(/:{"/) 
      test_name = test_name.delete("{").delete('"')
        params.split(/,/).each do|p|
          key,value = p.split(/":/) 
          key= key.delete('"')
          value =  value.delete("}").delete('"')
          test[key] = value
        end
      tests[test_name] = test
    end
    tests
  end

  def self.update_failing_tests_file(failing_tests)
    unless failing_tests.empty?
      file = read_file
      failing_tests.each do |key,value| 
        test = {}
        if file.has_key? key
          if value['failure'].to_i < 3
            file[:key]['flaky_failures'] = file[:key]['flaky_failures'].to_i + 1
          end
          file[key]['full_failures'] = file[key]['full_failures'].to_i + 1
          file[key]['last_failure'] = Time.new
        else
          test['full_failures'] = 1
          test['imgur'] = value[:imgur]
          test['last_failure'] = Time.new
          test['flaky_failure'] = value['failure']
          file[key] = test
        end
      end
      create_file(file)
    end
  end

  def save_failing_tests(failing_tests)
    update_failing_tests_file(failing_tests)
  end

  def self.create_file(tests)
    File.write('file.json', JSON.dump(tests))
  end
end