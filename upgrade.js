// TODO: okay what about "data modify" or "execute if data"
// TODO: what if it's in quotes, and what if it's setting a command block's command...
// TODO: escaped strings... within escaped strings... within strings... help

const {
  stringToObject,
  mapObject,
  generalUpgrade,
  stringToArray,
  objectToString,
  arrayToString,
  objHasProp,
  convertPredicate,
  removeNullProperties,
  findPairedBracket,
  replaceRange
} = require("./utils");
const changes = require("./changes");

function upgradeItem(obj) {
  // TODO: Upgrade Items (The ❤ of the operation)

  // Special changes before everything else
  changes.special.filter(c => c.priority < 0).sort((a, b) => a.priority - b.priority)
    .forEach(c => {
      if (!c.qualify(obj)) return;
      obj = c.modify(obj);
    });

  let objKeys = Object.keys(obj);
  Object.keys(changes.simple).forEach(key => {
    if (!objKeys.includes(key)) return;
    obj[changes.simple[key]] = obj[key].replace(/b/i, "");
    delete obj[key];
  });

  changes.complex.forEach(c => {
    if (!c.tag.find(t => objHasProp(obj, t))) return;
    console.log("apply", c);
    let replacement = typeof c.replacement == "function" ?
      c.replacement(...c.tag.map(t => obj[t])) :
      c.replacement;
    let newprop = c.parse(...c.tag.map(t => obj[t]));
    newprop[Symbol.for("pSplit")] = ":";
    if (c.hideflagsbit && obj.HideFlags & (2 << c.hideflagsbit))
      newprop = { ...newprop, show_in_tooltip: false };
    obj[replacement] = "{" + objectToString(newprop) + "}";
    c.tag.forEach(t => delete obj[t]);
  });

  // Special changes after everything else
  changes.special.filter(c => c.priority > 0).sort((a, b) => a.priority - b.priority)
    .forEach(c => {
      if (!c.qualify(obj)) return;
      obj = c.modify(obj);
    });
  return { ...obj, confirmation: true };
}

function upgradeEffect(obj) {
  // TODO: Upgrade Effects
  return obj;
}

function upgradeBlockData(obj) {
  // TODO: Upgrade Blocks
  return obj;
}

function upgradeEntityData(obj) {
  // Passengers: [ENTITYDATA...]
  if (obj.Passengers) obj.Passengers = "[" + arrayToString(
    stringToArray(obj.Passengers.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeEntityData))
  ) + "]";
  // ArmorItems: [ITEM, ITEM, ITEM, ITEM]
  if (obj.ArmorItems) obj.ArmorItems = "[" + arrayToString(
    stringToArray(obj.ArmorItems.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeItem))
  ) + "]";
  // Effects(Area Effect Cloud): [EFFECT...]
  if (obj.Effects) obj.Effects = "[" + arrayToString(
    stringToArray(obj.Effects.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeEffect))
  ) + "]";
  // body_armor_item: ITEM
  if (obj.body_armor_item) obj.body_armor_item = generalUpgrade(obj.body_armor_item, upgradeItem);
  // ArmorItem: ITEM
  if (obj.body_armor_item) obj.body_armor_item = generalUpgrade(obj.body_armor_item, upgradeItem);
  // HandItems: [ITEM, ITEM]
  if (obj.HandItems) obj.HandItems = "[" + arrayToString(
    stringToArray(obj.HandItems.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeItem))
  ) + "]";
  // Item(on some projectiles, item entities, item frames and potions): ITEM
  if (obj.Item) obj.Item = generalUpgrade(obj.Item, upgradeItem);
  // DecorItem(llama): ITEM
  if (obj.DecorItem) obj.DecorItem = generalUpgrade(obj.DecorItem.slice(1, -1), upgradeItem);
  // SpawnPotentials: { data: { entity: ENTITY } }
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
  // Items(containers): [ITEM...]
  if (obj.Items) obj.Items = "[" + arrayToString(
    stringToArray(obj.Items.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeItem))
  ) + "]";
  // Inventory: [ITEM...]
  if (obj.Inventory) obj.Inventory = "[" + arrayToString(
    stringToArray(obj.Inventory.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeItem))
  ) + "]";
  // EnderItems: [ITEM...]
  if (obj.EnderItems) obj.EnderItems = "[" + arrayToString(
    stringToArray(obj.EnderItems.slice(1, -1))
      .map(p => generalUpgrade(p, upgradeItem))
  ) + "]";
  // SelectedItem: ITEM
  if (obj.SelectedItem) obj.SelectedItem = generalUpgrade(obj.SelectedItem, upgradeItem);
  // RootVehicle: { Entity: ENTITYDATA }
  if (obj.RootVehicle) {
    let rv = stringToObject(obj.RootVehicle).slice(1, -1);
    if (rv.Entity) {
      rv.Entity = "{" + generalUpgrade(rv.Entity, upgradeEntityData) + "}";
      obj.RootVehicle = "{" +
        objectToString(rv)
        + "}";
    }
  }
  // ShoulderEntityLeft: ENTITYDATA
  if (obj.ShoulderEntityLeft) obj.ShoulderEntityLeft = generalUpgrade(obj.ShoulderEntityLeft, upgradeEntityData);
  // ShoulderEntityRight: ENTITYDATA
  if (obj.ShoulderEntityRight) obj.ShoulderEntityRight = generalUpgrade(obj.ShoulderEntityRight, upgradeEntityData);
  return obj;
  // TODO: Area Effect Clouds now store potions in the same format as the minecraft:potion_contents component in a potion_contents field:
  /*
    Potion -> potion_contents.potion
    Color -> potion_contents.custom_color
    effects -> potion_contents.custom_effects
  */
}

function line(line) {
  // important note, the changes only affect ITEM compounds, not ENTITY data (which is kinda dumb tbh)
  // EXCEPT: placed banners (blocks) also change their format on patterns
  if (!line.trim()) return "";
  if (line.startsWith("#")) return line;
  // TODO: identify components, extract data, apply changes, reformat

  // SELECTOR COMPONENT
  let startsearch = 0;
  const selectors = [];
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
    selectors.push(index, end + 1);
  }

  // COMMANDS
  line = line.replaceAll("run execute ", ""); // if anyone actually does this imma find you
  let executepart = "";
  if (line.startsWith("execute")) {
    // TODO: check for embedded execute
    let startofcommand = line.indexOf(" run ") + 5;
    executepart = line.slice(0, startofcommand);
    line = line.slice(0, startofcommand);
  }
  if (line.startsWith("clear") || line.startsWith("give")) {
    let startofselector = line.indexOf(" ") + 2;
    let endofselector = // note: "clear ".length == 7
      selectors.includes(startofselector) ? // if selector is conditional
        selectors[selectors.indexOf(startofselector) + 1] :
        (line.slice(startofselector).indexOf(" ") + startofselector);
    if (line.slice(endofselector).includes("{")) {
      let datastart = line.slice(endofselector).indexOf("{") + endofselector;
      let end = findPairedBracket(line, datastart) + 2;
      let str = line.substring(datastart, end);
      let nstr = generalUpgrade(str, upgradeItem);
      line = replaceRange(line, datastart, end, nstr);
    }
  } else if (line.startsWith("summon")) {
    let xyseperate = line.slice("summon ".length).indexOf(" ") + "summon ".length;
    let yzseperate = line.slice(xyseperate + 1).indexOf(" ") + xyseperate + 1;
    let start = line.slice(yzseperate + 1).indexOf(" ") + yzseperate + 2;
    if (line.slice(start).includes("{")) {
      let datastart = line.slice(start).indexOf("{") + start;
      let end = findPairedBracket(line, datastart) + 2;
      let str = line.substring(datastart, end);
      let nstr = generalUpgrade(str, upgradeEntityData);
      line = replaceRange(line, datastart, end, nstr);
    }
  } else if (line.startsWith("data")) {
    // TODO: data command
  } else if (line.startsWith("fill") || line.startsWith("setblock")) {
    let i = 0;
    for (let c = 0; c <= (line.startsWith("fill") ? 6 : 3); c++) i = line.slice(i).indexOf(" ") + i + 1;
    let pred = convertPredicate(line.slice(i));
    if (pred.nbtobj) pred.nbtobj = upgradeBlockData(pred.nbtobj);
    let nstr = `${pred.block}[${objectToString(pred.stateobj || {})}]{${objectToString(pred.nbtobj || {})}}`
    nstr.replaceAll(/\[\]|\{\}/g, "");
  } else if (line.startsWith("item")) {
    // TODO: item command
  }
  line = executepart + line;

  return line;
  // Extract component data
  /*
    Relevant commands:
      clear SELECTOR ITEMDATA
      summon SELECTOR X Y Z ENTITYDATA
      data (oh shit)
      execute
      fill X Y Z X Y Z BLOCKDATA
      setblock X Y Z BLOCKDATA
      give SELECTOR ITEMDATA
      item
    SELECTOR: @?[nbt=ENTITYDATA]
    BLOCKDATA: {
      Patterns (banners): convert to new format,
      Items (containers): [ITEM...]
      item (decorated pots): ITEM
    }
    Raw JSON text hoverEvent show_item
    https://minecraft.wiki/w/Data_pack#Folder_structure

    and an ITEM (entity) can be a container and thus have BLOCKDATA... recursive items lol
    this is gonna be fun
  */
}

module.exports = {
  function: file => file.split("\n").map(l => line(l, guarantees)),
  line
}