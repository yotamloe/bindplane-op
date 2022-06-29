# BindPlane Rest API

## Swagger

The Rest API endpoints are documented with [gin-swagger](https://github.com/swaggo/gin-swagger).

<hr>

**Generating Documentation:**

First make sure you have swag cli installed with `make install-tools` or install directly with:

```sh
go get -u github.com/swaggo/swag/cmd/swag
```

Generate docs.

```sh
make swagger
```

<hr>

**Viewing Documentation:**

Run bindplane server

```sh
bindplane serve
```

By default docs will be at [localhost:3001/swagger/index.html](http://localhost:3001/swagger/index.html)
