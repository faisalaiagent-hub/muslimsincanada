import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { validPoint, distanceKm } from '../lib/nearby.ts';
// Exercise the shipped device adapter with synthetic callbacks, without requesting
// the developer's or user's actual location or changing browser permissions.
const compiled = stripTypeScriptTypes(fs.readFileSync('lib/device-location.ts', 'utf8')).replace(/^import[^;]+;\s*/m, '').replace(/export /g, '');
const { getDevicePosition, locationErrorMessage } = new Function('validPoint', compiled + ';return {getDevicePosition, locationErrorMessage};')(validPoint);
let options;
const position = await getDevicePosition({ getCurrentPosition(success, failure, settings) { options = settings; success({ coords: { latitude: 43.589, longitude: -79.6441, accuracy: 35 } }); } });
assert.equal(position.latitude, 43.589); assert.equal(position.accuracy, 35); assert.ok(position.acquiredAt <= Date.now());
assert.equal(options.enableHighAccuracy, true); assert.equal(options.timeout, 15000); assert.equal(options.maximumAge, 60000);
await assert.rejects(getDevicePosition({ getCurrentPosition(success, failure) { failure({ code: 1 }); } }), /blocked/);
await assert.rejects(getDevicePosition({ getCurrentPosition(success, failure) { failure({ code: 3 }); } }), /too long/);
await assert.rejects(getDevicePosition({ getCurrentPosition(success) { success({ coords: { latitude: NaN, longitude: 181, accuracy: 0 } }); } }), /invalid location/);
assert.match(locationErrorMessage(2), /unavailable/);
const places = [{ id: 'far', latitude: 43.85, longitude: -79.2 }, { id: 'near', latitude: 43.59, longitude: -79.64 }];
assert.equal(places.sort((a, b) => distanceKm(position, a) - distanceKm(position, b))[0].id, 'near');
console.log('PASS: high-accuracy device adapter, accuracy metadata, permission denial, timeout, invalid coordinates and nearest-first ranking using synthetic locations.');
