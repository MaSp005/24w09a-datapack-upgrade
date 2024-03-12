const getPropSplit = str => str.charAt(Math.min(...[str.indexOf("="), str.indexOf(":")].filter(x => x != -1)));

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
  obj[Symbol("pSplit")] = propertySplitter;
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

const objectToString = obj => Object.keys(obj).map(k => k + "=" + obj[k]).join(obj[Symbol("pSplit")]);
const arrayToString = arr => arr.join(",");

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
  return { block, nbtstr, nbtobj, stateobj };
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
  let brackets = 0, i;
  for (i = index; i < str.length; i++) {
    // TODO: account for brackets in quotations (interpreted literally)
    if ("[{(".includes(str.charAt(i))) brackets++;
    if ("]})".includes(str.charAt(i))) {
      brackets--;
      if (!brackets) break;
    }
  }
  return i - 1;
}

const replaceRange = (str, start, end, replacement) => str.slice(0, start) + replacement + str.slice(end);

module.exports = { stringToObject, stringToArray, objectToString, arrayToString, convertPredicate, removeNullProperties, findPairedBracket, replaceRange };