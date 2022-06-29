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


# Exit if not systemd
case $(ps --no-headers -o comm 1) in
    systemd)
    ;;
    *)
        # The script should exit cleanly when systemd is not detected. This could
        # be a container runtime or an alternative like upstart or openrc.
        echo "Init system unknown, skipping systemd configuration."
        exit 0
    ;;
esac

reload_systemd() {
    systemctl daemon-reload
}

# DEB platforms should enable and start the service by default while
# RPM based platforms do not.
deb_post_install() {
    systemctl daemon-reload
    systemctl enable bindplane
    systemctl restart bindplane
}

# Main

if command -v dpkg >/dev/null; then
    deb_post_install
fi

reload_systemd
