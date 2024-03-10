const { stringToObject, findPairedBracket } = require("./utils");
const changes = require("./changes");

function line(line) {
  // important note, the changes only affect ITEM compounds, not ENTITY data (which is kinda dumb tbh)
  // EXCEPT: placed banners (blocks) also change their format on patterns
  if (!line.trim()) return "";
  if (line.startsWith("#")) return line;
  // TODO: identify components, extract data, reformat

  // Extract component data
  /*
    Relevant commands: 
      summon <entity> <xyz> ENTITYDATA
    SELECTOR: @?[nbt=ENTITYDATA]
    ENTITYDATA: {
      Passengers:[ENTITYDATA],
      ArmorItems:[ITEM,ITEM,ITEM,ITEM],
      Effects (Area Effect Cloud): [EFFECT],
      body_armor_item: ITEM,
      ArmorItem: ITEM,
      HandItems: [ITEM,ITEM],
      Item (on some projectiles, item entities, item frames and potions): ITEM,
      DecorItem (llama): ITEM
      SpawnPotentials: {data:{entity:ENTITY}},
      Items (containers): [ITEM...],
      Inventory: [ITEM...],
      EnderItems: [ITEM...],
      SelectedItem,
      RootVehicle: {Entity: ENTITYDATA},
      ShoulderEntityLeft: ENTITYDATA,
      ShoulderEntityRight: ENTITYDATA,
    }
    BLOCKDATA: {
      Patterns (banners): convert to new format,
      Items (containers): [ITEM...]
      item (pots): ITEM
    }
    and an ITEM can be a container and thus have BLOCKDATA... recursive items lol
    this is gonna be fun
  */
}

module.exports = {
  function: file => file.split("\n").map(l => line(l, guarantees)),
  line
}