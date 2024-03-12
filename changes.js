const { convertPredicate, removeNullProperties } = require("./utils");

const colors = [
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
];
const explosionShapes = [
  "small_ball",
  "large_ball",
  "star",
  "creeper",
  "burst"
];
const operators = ["add_value", "add_multiplied_base", "add_multiplied_total"];
const decorationTypes = [
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
];
// TODO: find new pattern codes
const patterns = {
  "b": "",
  "bs": "",
  "ts": "",
  "ls": "",
  "rs": "",
  "cs": "",
  "ms": "",
  "drs": "",
  "dls": "",
  "ss": "",
  "cr": "",
  "sc": "",
  "ld": "",
  "rud": "",
  "lud": "",
  "rd": "",
  "vh": "",
  "vhr": "",
  "hh": "",
  "hhb": "",
  "bl": "",
  "br": "",
  "tl": "",
  "tr": "",
  "bt": "",
  "tt": "",
  "bts": "",
  "tts": "",
  "mc": "",
  "mr": "",
  "bo": "",
  "cbo": "",
  "bri": "",
  "gra": "",
  "gru": "",
  "cre": "",
  "sku": "",
  "flo": "",
  "moj": "",
  "glb": "",
  "pig": ""
}

// module.exports = convertPredicate;
// module.exports = removeNullProperties;
module.exports = {
  // https://www.minecraft.net/en-us/article/minecraft-snapshot-24w09a
  simple: {
    "Damage": "damage",
    "RepairCost": "repair_cost",
    "display.Name": "custom_name",
    "display.Lore": "lore",
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
    "BlockStateTag": "block_state",
    "trim": "Trim",
    "DebugProperty": "debug_stick_state",
    "BlockEntityTag.note_block_sound": "note_block_sound",
    "BlockEntityTag.sherds": "pot_decorations",
    "SkullOwner": "profile"
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
        return removeNullProperties({ levels });
      }
    },
    {
      tag: "StoredEnchantments",
      hideflagsbit: 6,
      replacement: "stored_enchantments",
      parse: oldval => {
        let levels = {};
        JSON.parse(oldval).forEach(o => levels[o.id] = o.lvl);
        return removeNullProperties({ levels });
      }
    },
    {
      tag: "CanDestroy",
      hideflagsbit: 4,
      replacement: "can_break",
      parse: oldval => removeNullProperties({ predicates: oldval.map(convertPredicate) })
    },
    {
      tag: "CanPlaceOn",
      hideflagsbit: 5,
      replacement: "can_place_on",
      parse: oldval => removeNullProperties({ predicates: oldval.map(convertPredicate) })
    },
    {
      tag: "display.color",
      hideflagsbit: 7,
      replacement: "dyed_color",
      parse: oldval => removeNullProperties({ rgb: oldval })
    },
    {
      tag: "AttributeModifiers",
      hideflagsbit: 2,
      replacement: "attribute_modifiers",
      parse: oldval => removeNullProperties({
        modifiers: oldval.map(a => ({
          type: a.AttributeName,
          slot: a.Slot,
          uuid: a.UUID,
          name: a.Name,
          amount: a.Amount,
          operation: operators[a.Operation]
        }))
      })
    },
    {
      tag: "Decorations",
      replacement: "map_decorations",
      parse: oldval => removeNullProperties({
        x: oldval.x,
        z: oldval.x,
        rotation: oldval.rot,
        type: decorationTypes[oldval.type]
      })
    },
    {
      tag: "Potion,CustomPotionColor,custom_potion_effects",
      replacement: "potion_contents",
      parse: (potion, cpc, cpe) => removeNullProperties({
        potion, custom_color: cpc, custom_effects: cpe
      })
    },
    {
      tag: "pages,filtered_pages,title,filtered_title,author,generation,resolved",
      // pages and filtered pages are on both, all others only on written book
      replacement: (_p, _f, a, b, c, d, e, f) => a || b || c || d || e || f ? "written_book_contents" : "writable_book_contents",
      parse: (pages, fpages, title, ftitle, author, gen, res) => removeNullProperties({
        pages, title, author, generation: Math.min(gen, 2), resolved: !!res
      })
    },
    {
      tag: "NoAI,Silent,NoGravity,Glowing,Invulnerable,Health,Age,Variant,HuntingCooldown,BucketVariantTag",
      replacement: "bucket_entity_data",
      parse: (NoAI, Silent, NoGravity, Glowing, Invulnerable, Health, Age, Variant, HuntingCooldown, BucketVariantTag) => removeNullProperties({
        NoAI, Silent, NoGravity, Glowing, Invulnerable, Health, Age, Variant, HuntingCooldown, BucketVariantTag
      })
    },
    {
      tag: "LodestonePos,LodestoneDimension,LodestoneTracked",
      replacement: "lodestone_tracker",
      parse: (pos, dimension, tracked) => removeNullProperties({
        target: { pos, dimension }, tracked
      })
    },
    {
      tag: "Explosion",
      replacement: "firework_explosion",
      parse: oldval => removeNullProperties({
        shape: explosionShapes[oldval.Type],
        colors: oldval.Colors,
        fade_colors: oldval.FadeColors,
        has_trail: !!oldval.Trail,
        twinkle: !!oldval.Flicker
      })
    },
    {
      tag: "Fireworks",
      replacement: "fireworks",
      parse: oldval => removeNullProperties({
        explosions: oldval.Explosions.map(ex => ({
          shape: explosionShapes[ex.Type],
          colors: ex.Colors,
          fade_colors: ex.FadeColors,
          has_trail: !!ex.Trail,
          twinkle: !!ex.Flicker
        })),
        flight_duration: oldval.Flight
      })
    },
    /* {
      tag: "SkullOwner",
      replacement: "Profile",
      parse: oldval => ({
        name: oldval.name,
        id: oldval.id,
        properties: [...]
      })
    }, */
    // I think this uses the same format again now, moved to simple.
    {
      tag: "BlockEntityTag.Base",
      replacement: "base_color",
      parse: oldval => colors[oldval]
    },
    {
      tag: "BlockEntityTag.Patterns",
      replacement: "banner_patterns",
      parse: oldval => removeNullProperties(oldval.map(pat => ({
        color: colors[pat.Color], pattern: patterns[pat.Pattern]
      })))
    },
    {
      tag: "BlockEntityTag.Items",
      replacement: "container",
      // old: [{Slot:1b,id:"minecraft:end_crystal",Count:1b}]
      // TODO: recursive conversion for chest-like items
    },
    {
      tag: "BlockEntityTag.Bees",
      replacement: "bees",
      parse: oldval => removeNullProperties(oldval.map(bee => ({
        entity_data: bee.EntityData,
        ticks_in_hive: bee.TicksInHive,
        min_ticks_in_hive: bee.MinOccupationTicks
      })))
    },
    {
      tag: "BlockEntityTag.LootTable,BlockEntityTag.LootTableSeed",
      replacement: "bees",
      parse: (loot_table, seed) => removeNullProperties({ loot_table, seed })
    },
  ],
  special: [
    {
      priority: 1, // after everything else
      qualify: obj => obj.HideFlags & (2 << 6),
      modify: obj => {
        let { HideFlags, ...rest } = obj;
        return { ...rest, hide_additional_tooltip: {} };
      }
    },
    {
      priority: 1, // after everything else
      qualify: obj => obj.Count,
      modify: obj => {
        let { Count, ...rest } = obj;
        if (Count != "1b") rest.count = Count.replace("b", "");
        return rest;
      }
    },
    {
      priority: -1, // before anything else
      qualify: obj => obj.Enchantments == "[{}]",
      modify: obj => {
        let { Enchantments, ...rest } = obj;
        return { ...rest, enchantment_glint_override: true };
      }
    }
    // TODO: Area Effect Clouds now store potions in the same format as the minecraft:potion_contents component in a potion_contents field:
    /*
      Potion -> potion_contents.potion
      Color -> potion_contents.custom_color
      effects -> potion_contents.custom_effects
    */
  ]
}

// APPLIES TO COMMANDS: give, item, loot, clear
// additionally: Item Stack Format {id, Count (byte)} -> {id (namespace required), count (int, now optional), components}
// + other format changes