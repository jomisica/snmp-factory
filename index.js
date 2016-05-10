"use strict";

/*
 * Creates and manages the snmp connection pool
 *
 * @type {exports}
 */

var Promise = require('es6-promise').Promise;
var _ = require('underscore');
var snmp = require("net-snmp");


// Store all instantiated connections.
var snmpConnections = [];

module.exports = function() {

    return {

        /*
         * Gets a snmp connection from the pool.
         *
         * If the connection pool has not been instantiated yet, it is first
         * instantiated and a connection is returned.
         *
         * @returns {Promise|Connection} - A promise object that resolves to a snmp connection object.
         */
        getConnection: function getConnection(snmpSessionOptions) {

            return new Promise(function(resolve, reject) {

                // If snmpSessionOptions is null or undefined or object, return an error
                if (!snmpSessionOptions || typeof snmpSessionOptions !== 'object') {

                    return reject('getConnection must be called with a object Options');

                }

                // Check if a connection already exists for
                // the provided snmpSessionOptions.
                var exists = connectionExist(snmpSessionOptions);

                // If a connection pool was found, resolve
                // the promise with it.
                if (exists) {

                    return resolve(exists);

                }

                // If the connection pool has not been instantiated,
                // instantiate it and return the connection.
                var connection = snmp.createSession(snmpSessionOptions.ip, snmpSessionOptions.community, snmpSessionOptions.options);

                /*
                 * net-snmp only tests the connection
                 * when using get, set etc.
                 * it is necessary to test the connection
                 * before you put it in the pool.
                 */

                // To test the connection is required oid.
                // This is a fake oid.
                var oids = ["1.1.1.1.1"];
                connection.get(oids, function(error, varbinds) {

                    // If returned RequestTimeOutError is because
                    // it has not been to communicate with the device.
                    if (error.name == "RequestTimedOutError") {

                        return reject(error);

                    } else {

                        // Check again if a connection already exists
                        // for the provided snmpSessionOptions.
                        // It is made possible if several calls
                        // simultaneously for the same device
                        var exists = connectionExist(snmpSessionOptions);

                        // If a connection pool was found, resolve
                        // the promise with it.
                        if (exists) {
                            // We need to close the test connection
                            connection.close();

                            return resolve(exists);
                        }

                        // Store the connection in the snmpConnections array.
                        snmpConnections.push({
                            snmpSessionOptions: snmpSessionOptions,
                            connection: connection
                        });

                        // Resolve the promise with the new connection.
                        return resolve(connection);

                    }

                });

            });

        },

        // Exposes isVarbindError function.
        isVarbindError: snmp.isVarbindError,

        // Exposes varbindError function.
        varbindError: snmp.varbindError

    };

}();

function connectionExist(snmpSessionOptions) {
    for (var x = 0; x < snmpConnections.length; x++) {
        if (_.isEqual(snmpConnections[x].snmpSessionOptions, snmpSessionOptions)) {
            return snmpConnections[x].connection;
        }
    }
    return null;
}

