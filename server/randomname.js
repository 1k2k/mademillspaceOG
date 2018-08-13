'use strict';

var ADJECTIVES = [
  'Abra', 'sive', 'Brash', 'Cal', 'lous', 'Daft', 'Ec', 'cent', 'ric', 'Fiesty', 'Golden',
  'Holy', 'Ignom', 'inious', 'Jol', 'tin', 'Ki', 'ller', 'Lus', 'cio', 'us', 'Mushy', 'Nasty',
  'OldSc', 'hool', 'Po', 'mpous', 'Qu', 'iet', 'Rowdy', 'Sneaky', 'Tawdry',
  'Unique', 'Viva', 'cious', 'Wicked', 'Xe', 'nopho', 'bic', 'Yaw', 'ning', 'Zesty'
];

var FIRST_NAMES = [
  'Anna', 'Bob', 'by', 'Cam', 'eron', 'Da', 'nny', 'Emm', 'ett', 'Frida', 'Grac', 'ie', 'Ha', 'nah',
  'I', 'saac', 'Jen', 'ova', 'Ken', 'dra', 'Lando', 'Muf', 'asa', 'Nate', 'Owen', 'Penny',
  'Qui', 'ncy', 'Ro', 'ddy', 'Sam', 'ant', 'ha', 'Tammy', 'Uly', 'sses', 'Vict', 'ria', 'Wen', 'dy',
  'Xan', 'der', 'Yola', 'nda', 'Zel', 'da'
];

var LAST_NAMES = [
  'Anch', 'orage', 'Ber', 'lin', 'Cuc', 'amo', 'nga', 'Dav', 'enp', 'rt', 'Es', 'sex', 'Fr', 'esno',
  'Gun', 'sight', 'Hano', 'ver', 'India', 'na', 'polis', 'James', 'town', 'Kane', 'Lib', 'erty',
  'Min', 'ne', 'apo', 'lis', 'Nev', 'is', 'Oakland', 'Port', 'land', 'Quan', 'tico', 'Rale', 'igh',
  'Sai', 'ntP', 'aul', 'Tul', 'sa', 'Ut', 'ica', 'Vail', 'War', 'saw', 'Xi', 'aoJin', 'Yale',
  'Zimm', 'erman'
];

function randomItem(array) {
  var randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

module.exports = function randomName() {
  return randomItem(ADJECTIVES) +
    randomItem(FIRST_NAMES) +
    randomItem(LAST_NAMES);
};
