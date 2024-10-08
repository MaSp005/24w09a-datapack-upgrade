# 24w09a Datapack Upgrade

Upgrades datapacks to the new NBT format.

---

## Status: Cancelled.

**This project has been cancelled and will no longer be developed by me. Use (and contribute to) the more fleshed out project [Easy Map Updater](https://github.com/StickyPiston-Hosting/Easy-Map-Updater).**

---

As of Mar 18, updating individual commands can be done on [MCStacker Snapshot](https://mcstacker.net/1.20.5.php). They beat me to it. As aforementioned, this is only possible for individual commands and still a heck of a lot of work for a whole datapack, so development will continue in the hopes of making that a bit easier.

Additionally, [this converter](https://misode.github.io/nbt2components/) can update old Item NBT to 1.20.5 Components.

# Structure

`changes.js` lists the format changes based on the official changelog.

`upgrade.js` upgrades individual commands or functions to the new format. (basically applies `changes.js`)

`index.js` handles unzipping, upgrading and rezipping datapacks.

`utils.js` holds utility functions for use throughout the other files.

# Contributing

~~Contributions in the form of PR's are welcome at any time. (There really is not set style convention, just make sure it's somewhat legible)~~

Any problems that still need fixing are marked with ``// TODO`` comments.

~~Once the script is done and released, I'd love for you to report any problems you find by opening an issue.~~