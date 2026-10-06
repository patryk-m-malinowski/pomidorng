import { Meteor } from "meteor/meteor";
var crypto = require("crypto");

export function getClientIpHash(connection: Meteor.Connection): string {
  let clientIp = connection.clientAddress;

  //Hash the IP address to protect user privacy
  let hash = crypto.createHash("sha1");
  hash.update(clientIp);
  return hash.digest("hex");
}