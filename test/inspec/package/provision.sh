#!/bin/bash
# Copyright  observIQ, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e

rpm_install() {
    sudo rpm -i '/tmp/data/bindplane_*_linux_amd64.rpm'
}

deb_install() {
    sudo apt-get install -y -f /tmp/data/bindplane_*_linux_amd64.deb
}

start() {
    sudo systemctl enable bindplane
    sudo systemctl start bindplane
}

if command -v "dpkg" > /dev/null ; then
    deb_install
elif command -v "rpm" > /dev/null ; then
    rpm_install
else
    echo "failed to detect platform type"
    exit 1
fi
start
