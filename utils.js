const getPropSplit = str => str.charAt(Math.min(...[str.indexOf("="), str.indexOf(":")].filter(x => x != -1)));

const mapObject = (obj, func) => Object.fromEntries(
  Object.entries(obj).map(([key, value]) => [key, func(value)])
);

const generalUpgrade = (srcObj, upgradeFunc) => "{" +
  objectToString(upgradeFunc(stringToObject(srcObj.slice(1, -1)))) + "}";

function stringToObject(str) {
  if (!str.length) return {};
  let obj = {};
  let i = 0;
  let propertySplitter = getPropSplit(str);
  while (true) {
    let nextequal = i + str.slice(i).indexOf(propertySplitter);
    let property = str.substring(i, nextequal);
    let nextcomma = ("[{(".includes(str.charAt(nextequal + 1))) ?
      (findPairedBracket(str, nextequal + 1) + 2) :
      (str.slice(nextequal).includes(",") ?
        str.slice(nextequal).indexOf(",") + nextequal :
        str.length);
    i = nextcomma + 1;
    let value = str.substring(nextequal + 1, nextcomma);
    obj[property] = value;
    if (nextcomma >= str.length) break;
  }
  obj[Symbol.for("pSplit")] = propertySplitter;
  return obj;
}

function stringToArray(str) {
  let obj = [];
  let i = 0;
  while (true) {
    let nextcomma = ("[{(".includes(str.charAt(i))) ?
      (findPairedBracket(str, i) + 2) :
      (str.slice(i).includes(",") ?
        str.slice(i).indexOf(",") + i :
        str.length);
    let value = str.substring(i, nextcomma);
    obj.push(value);
    i = nextcomma + 1;
    if (nextcomma >= str.length) break;
  }
  return obj;
}

const objectToString = obj => Object.keys(obj).map(k => k + obj[Symbol.for("pSplit")] + obj[k]).join(",");
const arrayToString = arr => arr.join(",");

function getObjProp(obj, prop) {
  if (!prop.includes(".")) return obj[prop];
  let steps = prop.split(".");
  for (i = 0; i < steps.length; i++) {
    if (typeof obj == "string" && obj.startsWith("{")) obj = stringToObject(obj.slice(1, -1));
    if (!Object.keys(obj).includes(steps[i])) return null;
    obj = obj[steps[i]];
  }
  return obj;
}

function replaceObjProp(obj, prop, replacement) {
  if (!prop.includes(".")) return { ...obj, [prop]: replacement };
  let steps = ["", ...prop.split(".")];
  let evolutions = [obj];
  for (i = 1; i < steps.length; i++) {
    if (typeof evolutions[i - 1] == "string" && evolutions[i - 1].startsWith("{"))
      evolutions[i - 1] = stringToObject(evolutions[i - 1].slice(1, -1));
    if (!Object.keys(evolutions[i - 1]).includes(steps[i])) return obj;
    evolutions[i] = evolutions[i - 1][steps[i]];
  }
  for (i = steps.length - 1; i > 0; i--) {
    evolutions[i - 1][steps[i]] = "{" + objectToString(evolutions[i]) + "}";
  }
  return obj;
}

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
  let stateobj = !statestr ? null : stringToObject(statestr.slice(1, -1));
  let nbtobj = !nbtstr ? null : eval("(" + nbtstr + ")");
  return { block, nbtobj, stateobj };
}

function removeNullProperties(obj) {
  if (typeof obj != "object" || obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(removeNullProperties);
  Object.keys(obj).forEach(key => {
    let val = obj[key];
    if (val === undefined || val === null) return void (delete obj[key]);
    if (typeof val == "object") {
      if (Array.isArray(val)) obj[key] = val.map(removeNullProperties);
      obj[key] = removeNullProperties(val);
    }
  });
  return obj;
};

function findPairedBracket(str, index) {
  let brackets = 0, i, inquotes = false;
  for (i = index; i < str.length; i++) {
    if (str.charAt(i) == '"') {
      let c;
      for (c = 0; i - c > 0; c++) {
        if (str[i - c - 1] != '\\') break;
      }
      if (c % 2 == 0) inquotes = !inquotes;
    }
    if (!inquotes) {
      if ("[{(".includes(str.charAt(i))) brackets++;
      if ("]})".includes(str.charAt(i))) {
        brackets--;
        if (!brackets) break;
      }
    }
  }
  return i - 1;
}

const replaceRange = (str, start, end, replacement) => str.slice(0, start) + replacement + str.slice(end);

module.exports = {
  stringToObject,
  mapObject,
  generalUpgrade,
  stringToArray,
  objectToString,
  arrayToString,
  getObjProp,
  replaceObjProp,
  convertPredicate,
  removeNullProperties,
  findPairedBracket,
  replaceRange
};