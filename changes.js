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
module.exports = [
  {
    tag: "Damage",
    replacement: "damage"
  },
  {
    tag: "RepairCost",
    replacement: "repair_cost"
  },
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
    tag: "display.Name",
    replacement: "custom_name"
  },
  {
    tag: "display.Lore",
    replacement: "lore"
  },
  {
    tag: "display.Name",
    replacement: "custom_name"
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
]