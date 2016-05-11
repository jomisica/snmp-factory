# snmp-factory

> A very simple snmp connection pool manager

> The purpose of this module is to reuse existing connections
> to a particular device.

> Open a new connection whenever you intend to communicate with a device
> is costly and causes slowness in aplications and prevent nodejs
> exceed their limetes.

## Usage

```js
    var snmpFactory = require("snmp-factory");

    var snmpSessionOptions = {
        ip: "127.0.0.1",
        community: "private",
        options: {
            port: 161,
            retries: 1,
            timeout: 500,
            transport: "udp4",
            version: 1
        }
    };

    snmpFactory.getConnection(snmpSessionOptions).then(function(connection) {

        var oids = ["1.3.6.1.2.1.1.5.0", "1.3.6.1.2.1.1.6.0"];

        connection.get(oids, function(error, varbinds) {

            if (error) {

                console.error(error);

            } else {

                for (var i = 0; i < varbinds.length; i++) {

                    if (snmpFactory.isVarbindError(varbinds[i])) {

                        console.error(snmpFactory.varbindError(varbinds[i]));

                    } else {

                        console.log(varbinds[i].oid + " = " + varbinds[i].value);

                    }

                }

            }

        });

    }).catch(function(error) {

        console.error(error);

    });
```

## API

#### `getConnection(snmpSessionOptions)`

The only parameter is a connection object for a snmp connection.

#### `isVarbindError`

Exposes the net-snmp isVarbindError function.

#### `varbindError`

Exposes the net-snmp varbindError function.

