function convertPredicate(str) {
  if (typeof str != "string") return str;
  let startofdata = str.search(/\[|\{/);
  if (startofdata == -1) return { blocks: str };
  let block = str.slice(0, startofdata);
  let nbtfirst = str.charAt(startofdata) == "{";
  let startofseconddata = str.indexOf(nbtfirst ? "}[" : "]{");
  if (startofseconddata != -1) startofseconddata++;
  let nbtstr, statestr;
  if (nbtfirst) {
    nbtstr = str.slice(startofdata, startofseconddata == -1 ? undefined : startofseconddata);
    statestr = startofseconddata == -1 ? "" : str.slice(startofseconddata);
  } else {
    statestr = str.slice(startofdata, startofseconddata == -1 ? undefined : startofseconddata);
    nbtstr = startofseconddata == -1 ? "" : str.slice(startofseconddata);
  }
  let stateobj = !statestr ? null : statestr.slice(1, -1).split(',').reduce((acc, curr) => {
    const [key, value] = curr.split('=');
    acc[key] = value;
    return acc;
  }, {});
  let nbtobj = !nbtstr ? null : eval("(" + nbtstr + ")");
  return { block, nbtstr, nbtobj, stateobj };
}

// module.exports = convertPredicate;
module.exports = {
  simple: {
    "Damage": "damage",
    "RepairCost": "repair_cost",
    "display.Name": "custom_name",
    "display.Lore": "lore",
    "display.Name": "custom_name",
    "ChargedProjectiles": "charged_projectiles",
    "Items": "bundle_contents",
    "display.MapColor": "map_color",
    "map": "map_id",
    "CustomModelData": "custom_model_data",
    "effects": "suspicious_stew",
    "EntityTag": "entity_data",
    "instrument": "instrument",
    "Recipes": "recipes",
    "BlockEntityTag.Lock": "lock",
    "BlockEntityTag": "block_entity_data",
    "BlockStateTag": "block_state"
  },
  complex: [
    {
      tag: "Unbreakable",
      hideflagsbit: 3,
      replacement: "unbreakable"
    },
    {
      tag: "Enchantments",
      hideflagsbit: 2,
      replacement: "enchantments",
      parse: oldval => {
        let levels = {};
        JSON.parse(oldval).forEach(o => levels[o.id] = o.lvl);
        return { levels };
      }
    },
    {
      tag: "StoredEnchantments",
      hideflagsbit: 6,
      replacement: "stored_enchantments",
      parse: oldval => {
        let levels = {};
        JSON.parse(oldval).forEach(o => levels[o.id] = o.lvl);
        return { levels };
      }
    },
    {
      tag: "CanDestroy",
      hideflagsbit: 4,
      replacement: "can_break",
      parse: oldval => ({ predicates: oldval.map(convertPredicate) })
    },
    {
      tag: "CanPlaceOn",
      hideflagsbit: 5,
      replacement: "can_place_on",
      parse: oldval => ({ predicates: oldval.map(convertPredicate) })
    },
    {
      tag: "display.color",
      hideflagsbit: 7,
      replacement: "dyed_color",
      parse: oldval => ({ rgb: oldval })
    },
    {
      tag: "AttributeModifiers",
      hideflagsbit: 2,
      replacement: "attribute_modifiers",
      parse: oldval => ({
        modifiers: oldval.map(a => {
          let obj = {};
          if (a.AttributeName) obj.type = a.AttributeName;
          if (a.Slot) obj.slot = a.Slot;
          if (a.UUID) obj.uuid = a.UUID;
          if (a.Name) obj.name = a.Name;
          if (a.Amount) obj.amount = a.Amount;
          if (a.Operation) obj.operation = ["add_value", "add_multiplied_base", "add_multiplied_total"][a.Operation];
        })
      })
    },
    // New Tag: intangible_projectile
    {
      tag: "Decorations",
      replacement: "map_decorations",
      parse: oldval => ({
        x: oldval.x,
        z: oldval.x,
        rotation: oldval.rot,
        type: [
          "player",
          "frame",
          "red_marker",
          "blue_marker",
          "target_x",
          "target_point",
          "player_off_map",
          "player_off_limits",
          "mansion",
          "monument",
          "banner_white",
          "banner_orange",
          "banner_magenta",
          "banner_light_blue",
          "banner_yellow",
          "banner_lime",
          "banner_pink",
          "banner_gray",
          "banner_light_gray",
          "banner_cyan",
          "banner_purple",
          "banner_blue",
          "banner_brown",
          "banner_green",
          "banner_red",
          "banner_black",
          "red_x",
          "village_desert",
          "village_plains",
          "village_savanna",
          "village_snowy",
          "village_taiga",
          "jungle_temple",
          "swamp_hut"
        ][oldval.type]
      })
    },
    // potion_contents
    // writable_book_contents
    // written_book_contents
    // trim
    // suspicious_stew
    // hide_additional_tooltip !!!
    // debug_stick_state
    // bucket_entity_data
    // lodestone_target < LodestonePos, LodestoneDimension, LodestoneTracked
    // firework_explosion
    // fireworks
    // profile
    // note_block_sound
    // base_color 
    {
      tag: "BlockEntityTag.Base",
      replacement: "base_color",
      parse: oldval => [
        "white",
        "orange",
        "magenta",
        "light_blue",
        "yellow",
        "lime",
        "pink",
        "gray",
        "light_gray",
        "cyan",
        "purple",
        "blue",
        "brown",
        "green",
        "red",
        "black"
      ][oldval]
    },
    // banner_patterns
    // pot_decorations
    // container
    // bees
    // container_loot (ah shit)
    // enchantment_glint_override to replace empty Enchantments
  ]
}

// APPLIES TO COMMANDS: give, item, loot, clear
// additionally: Item Stack Format {id, Count (byte)} -> {id (namespace required), count (int, now optional), components}
// + other format changes