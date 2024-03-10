# 24w09a Datapack Upgrade

Upgrades datapacks to the new NBT format.

## Status: Too early.

`changes.js` lists the format changes based on the official changelog. (heart of the operation)

`upgrade.js` upgrades individual commands or functions to the new format. (basically applies `changes.js`)

`index.js` handles unzipping, upgrading and rezipping datapacks.

`utils.js` holds utility functions for use throughout the other files.