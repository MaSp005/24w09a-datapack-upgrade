function stringToObject(str) {
  console.log(str);
  let obj = {};
  let i = 0;
  while (true) {
    let nextequal = i + str.slice(i).indexOf("=");
    let property = str.substring(i, nextequal);
    let nextcomma = (/[\[\{\(]/.test(str.charAt(nextequal + 1))) ?
      (findPairedBracket(str, nextequal + 1) - nextequal + 1) :
      (str.slice(nextequal).includes(",") ?
        str.slice(nextequal).indexOf(",") + nextequal :
        str.length);
    i = nextcomma + 1;
    let value = str.substring(nextequal + 1, nextcomma);
    console.log(nextequal, property, nextcomma, value, i);
    obj[property] = value;
    if (str.charAt(nextcomma) == "" || str.charAt(nextcomma + 1) == "") break;
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
  console.log("---")
  console.log(str)
  let brackets = 0, i;
  for (i = index; i < str.length; i++) {
    if (/[\[\{\(]/.test(str.charAt(i))) brackets++;
    if (/[\]\}\)]/.test(str.charAt(i))) {
      if (!brackets) break;
      brackets--;
    }
  }
  console.log(i, str.slice(index, i - index - 1));
  console.log("---")
  return i - 1;
}

module.exports = { stringToObject, convertPredicate, removeNullProperties, findPairedBracket };