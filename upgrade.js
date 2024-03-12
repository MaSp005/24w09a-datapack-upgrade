// TODO: okay what about "data modify" or "execute if data"

const { stringToObject, stringToArray, objectToString, arrayToString, convertPredicate, removeNullProperties, findPairedBracket, replaceRange } = require("./utils");
const changes = require("./changes");

function generalUpgrade(srcObj, upgradeFunc) {
  return "{" + objectToString(upgradeFunc(stringToObject(srcObj.slice(1, -1)))) + "}"
}

function upgradeItem(obj) {
  // TODO: Upgrade Items (The ❤ of the operation)
  return obj;
}

function upgradeEffect(obj) {
  // TODO: Upgrade Effects
  return obj
}

function upgradeEntityData(obj) {
  // Passengers: [ENTITYDATA], ✅
  if (obj.Passengers) obj.Passengers = "[" + arrayToString(
    stringToArray(obj.Passengers.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeEntityData))
  ) + "]";
  // ArmorItems: [ITEM, ITEM, ITEM, ITEM], ✅
  if (obj.ArmorItems) obj.ArmorItems = "[" + arrayToString(
    stringToArray(obj.ArmorItems.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeItem))
  ) + "]";
  // Effects(Area Effect Cloud): [EFFECT], ✅
  if (obj.Effects) obj.Effects = "[" + arrayToString(
    stringToArray(obj.Effects.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeEffect))
  ) + "]";
  // body_armor_item: ITEM, ✅
  if (obj.body_armor_item) obj.body_armor_item = generalUpgrade(obj.body_armor_item, upgradeItem);
  // ArmorItem: ITEM, ✅
  if (obj.body_armor_item) obj.body_armor_item = generalUpgrade(obj.body_armor_item, upgradeItem);
  // HandItems: [ITEM, ITEM], ✅
  if (obj.HandItems) obj.HandItems = "[" + arrayToString(
    stringToArray(obj.HandItems.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeItem))
  ) + "]";
  // Item(on some projectiles, item entities, item frames and potions): ITEM, ✅
  if (obj.Item) obj.Item = generalUpgrade(obj.Item, upgradeItem);
  // DecorItem(llama): ITEM ✅
  if (obj.DecorItem) obj.DecorItem = generalUpgrade(obj.DecorItem.slice(1, -1), upgradeItem);
  // SpawnPotentials: { data: { entity: ENTITY } }, ✅
  if (obj.SpawnPotentials) {
    let sp = stringToObject(obj.SpawnPotentials).slice(1, -1);
    if (sp.data) {
      let data = stringToObject(sp.data).slice(1, -1);
      if (data.entity) {
        data.entity = generalUpgrade(data.entity, upgradeEntityData);
        sp.data = "{" +
          objectToString(data)
          + "}";
        obj.SpawnPotentials = "{" +
          objectToString(sp)
          + "}";
      }
    }
  }
  // Items(containers): [ITEM...], ✅
  if (obj.Items) obj.Items = "[" + arrayToString(
    stringToArray(obj.Items.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeItem))
  ) + "]";
  // Inventory: [ITEM...], ✅
  if (obj.Inventory) obj.Inventory = "[" + arrayToString(
    stringToArray(obj.Inventory.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeItem))
  ) + "]";
  // EnderItems: [ITEM...], ✅
  if (obj.EnderItems) obj.EnderItems = "[" + arrayToString(
    stringToArray(obj.EnderItems.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeItem))
  ) + "]";
  // SelectedItem: ITEM, ✅
  if (obj.SelectedItem) obj.SelectedItem = generalUpgrade(obj.SelectedItem, upgradeItem);
  // RootVehicle: { Entity: ENTITYDATA }, ✅
  if (obj.RootVehicle) {
    let rv = stringToObject(obj.RootVehicle).slice(1, -1);
    if (rv.Entity) {
      rv.Entity = "{" + generalUpgrade(rv.Entity, upgradeEntityData) + "}";
      obj.RootVehicle = "{" +
        objectToString(rv)
        + "}";
    }
  }
  // ShoulderEntityLeft: ENTITYDATA, ✅
  if (obj.ShoulderEntityLeft) obj.ShoulderEntityLeft = generalUpgrade(obj.ShoulderEntityLeft, upgradeEntityData);
  // ShoulderEntityRight: ENTITYDATA, ✅
  if (obj.ShoulderEntityRight) obj.ShoulderEntityRight = generalUpgrade(obj.ShoulderEntityRight, upgradeEntityData);
  return obj;
}

function line(line) {
  // important note, the changes only affect ITEM compounds, not ENTITY data (which is kinda dumb tbh)
  // EXCEPT: placed banners (blocks) also change their format on patterns
  if (!line.trim()) return "";
  if (line.startsWith("#")) return line;
  // TODO: identify components, extract data, apply changes, reformat

  // SELECTOR COMPONENT
  let startsearch = 0;
  while (true) {
    let index = line.slice(startsearch).search(/@[aespr]\[/);
    if (index == -1) break;
    index += startsearch;
    let end = findPairedBracket(line, index + 2) + 1;
    let str = line.substring(index + 3, end);
    let obj = stringToObject(str);
    if (obj.nbt) obj.nbt = generalUpgrade(obj.nbt, upgradeEntityData);
    let nstr = objectToString(obj);
    line = replaceRange(line, index + 3, end, nstr);
    startsearch = end + (nstr.length - str.length);
    console.log(index, end, str, obj, nstr);
  }
  return line;

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
      SelectedItem: ITEM,
      RootVehicle: {Entity: ENTITYDATA},
      ShoulderEntityLeft: ENTITYDATA,
      ShoulderEntityRight: ENTITYDATA,
    }
    BLOCKDATA: {
      Patterns (banners): convert to new format,
      Items (containers): [ITEM...]
      item (decorated pots): ITEM
    }
    and an ITEM can be a container and thus have BLOCKDATA... recursive items lol
    this is gonna be fun
  */
}

module.exports = {
  function: file => file.split("\n").map(l => line(l, guarantees)),
  line
}