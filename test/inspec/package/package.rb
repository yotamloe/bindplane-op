describe file('/usr/local/bin/bindplane') do
    its('mode') { should cmp '0755' }
    its('owner') { should eq 'root' }
    its('group') { should eq 'root' }
    its('type') { should cmp 'file' }
end

describe file('/etc/bindplane/config.yaml') do
    its('mode') { should cmp '0640' }
    its('owner') { should eq 'bindplane' }
    its('group') { should eq 'bindplane' }
    its('type') { should cmp 'file' }
end

describe file('/var/lib/bindplane/storage/bindplane.db') do
    its('mode') { should cmp '0640' }
    its('owner') { should eq 'bindplane' }
    its('group') { should eq 'bindplane' }
    its('type') { should cmp 'file' }
end

describe file('/var/log/bindplane/bindplane.log') do
    its('mode') { should cmp '0644' }
    its('owner') { should eq 'bindplane' }
    its('group') { should eq 'bindplane' }
    its('type') { should cmp 'file' }
end

[
    '/var/lib/bindplane',
    '/var/lib/bindplane/storage',
    '/var/lib/bindplane/downloads'
].each do |dir|
    describe file(dir) do
        its('mode') { should cmp '0750' }
        its('owner') { should eq 'bindplane' }
        its('group') { should eq 'bindplane' }
        its('type') { should cmp 'directory' }
    end
end

describe file('/var/log/bindplane') do
    its('mode') { should cmp '0750' }
    its('owner') { should eq 'bindplane' }
    its('group') { should eq 'bindplane' }
    its('type') { should cmp 'directory' }
end

describe file('/usr/lib/systemd/system/bindplane.service') do
    its('mode') { should cmp '0640' }
    its('owner') { should eq 'root' }
    its('group') { should eq 'root' }
    its('type') { should cmp 'file' }
end

describe user('bindplane') do
    it { should exist }
    its('group') { should eq 'bindplane' }
    its('lastlogin') { should eq nil }
    its('shell') { should eq '/sbin/nologin' }
end

describe group('bindplane') do
    it { should exist }
end

# On centos / rhel / fedora the service will need to be enabled
# and started before running tests due to conventions.
describe systemd_service('bindplane') do
    it { should be_installed }
    it { should be_enabled }
    it { should be_running }
end

# secure default install listens on localhost only
describe port(3001) do
    it { should be_listening }
    its('protocols') { should include 'tcp' }
    its('addresses') { should include '127.0.0.1' }
    its('addresses') { should_not include '0.0.0.0' }
    its('processes') {should include 'bindplane'}
end

# no auth health endpoint
describe http('http://localhost:3001/health') do
    its('status') { should cmp 200 }
end

# GET smoke test
[
    'v1/version',
    'v1/agents',
    'v1/exporters',
    'v1/receivers',
].each do |path|
    path = "http://localhost:3001/#{path}"

    # auth
    describe http(path, auth: {user: 'admin', pass: 'admin'}) do
            its('status') { should cmp 200 }
    end
end

describe processes('bindplane') do
    its('users') { should eq ['bindplane'] }
end
