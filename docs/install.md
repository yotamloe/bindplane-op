# Installation

Each release contains binaries, server packages, and client packages. See the [releases](https://github.com/observIQ/bindplane/releases) page.
BindPlane does not have any dependencies, and can run on Windows, Linux, and macOS.

- Binaries: `bindplane-<version>-<platform>-<arch>.zip`
- Server packages debian: `bindplane_<version>_<platform>_<arch>.deb`
- Client packages: debian: `bindplane-client_<version>_<platform>_<arch>.rpm`
- Server packages rhel: `bindplane_<version>_<platform>_<arch>.deb`
- Client packages: rhel: `bindplane-client_<version>_<platform>_<arch>.rpm`

## Operating System Support

### Linux

The following distributions are officially supported:

- Red Hat, Centos, Oracle Linux 7 and 8
- Alma and Rocky Linux
- Debian 10 and 11
- Ubuntu LTS 18.04, 20.04
- Suse Linux 12 and 15

BindPlane is written in Go, and will generally run on any modern distribution of Linux.
Systemd is the only supported init system. BindPlane will install on a non systemd system, 
however, service management will be up to the user and is not a supported solution.

### Windows

TODO: Build MSI and determine support.

- 2012r2 server EOL is Oct 2023
- 2016 EOL is 2027
- 2019
- 2022

BindPlane should have no issue installing and running on Server 2012R2 or newer. At the time of this
writing, a Windows package is not available.

## Installing BindPlane Server

Debian and RHEL style packages are available for BindPlane Server.

### Script

An installation script is available to simplify installation.

```bash
curl -s https://storage.googleapis.com/observiq-cloud/bindplane/latest/install-linux.sh | bash -s --
```

Once installed, you can check the service.

```bash
sudo systemctl status bindplane
```

### Docker

BindPlane can run as a container using Docker. The following commands will:

- Name container `bindplane`
- Keep persistent data in a volume named `bindplane`
- Expose port 3001 (REST and Websocket)

```bash
docker volume create bindplane

docker run -d \
    --name bindplane \
    --restart always \
    --mount source=bindplane,target=/data \
    -p 3001:3001 \
    observiq/bindplane:latest
```

## BindPlane Client

Debian, RHEL, and Alpine stype packages are available for BindPlane Client. The packages will install
the same binary included with the BindPlane server package, but will not create a user, config, log,
storage directory, or service.

Once installed, the `bindplane` command will be available and can be used to connect to an BindPlane server.
See [docs/configuration.md](docs/configuration.md) for configuration instructions.

### Installing Client on Debian / Ubuntu

Example (amd64):

```bash
curl -L -o bindplane.deb https://github.com/observIQ/bindplane/releases/download/v0.0.26/bindplane-client_0.0.26_linux_amd64.deb
sudo apt-get install -f ./bindplane.deb
```

### Installing Client on Centos / RHEL

Example (amd64):

```bash
sudo dnf install https://github.com/observIQ/bindplane/releases/download/v0.0.26/bindplane-client_0.0.26_linux_amd64.rpm
```

### Installing on Alpine

Example (amd64):

```bash
sudo apk add --allow-untrusted https://github.com/observIQ/bindplane/releases/download/v0.0.26/bindplane-client_0.0.26_linux_amd64.apk
```

### Installing Client on macOS

**Homebrew**

Using Homebrew, you can install BindPlane with:

```bash
brew tap observiq/homebrew-bindplane
brew update
brew install observiq/bindplane/bindplane
```

**Script**

A script is available for installing the macOS client.

```bash
curl -s https://storage.googleapis.com/observiq-cloud/bindplane/latest/install-macos.sh | bash -s --
```
