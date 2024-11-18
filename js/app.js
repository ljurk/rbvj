let rbvj;

// add drawing canvases
const ctx = createCanvas("canvas1");
const ctx2 = createCanvas("canvas2");
const ctx3 = createCanvas("canvas3");

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;
renderer.localClippingEnabled = true;
document.getElementById("canvas3D").appendChild(renderer.domElement);

// setFileLocation to defaults
// keys A-Z change files
// keys 0-9 change banks
// keys SHIFT 0-9 change sets

// files are stored in /art
// art/currentSet/currentBank/currentFile

const art_location = "/art";

let fileref;
let current_file = 0;
let current_set = 0;
let current_bank = 0;

function setup() {
  //changeFile(current_file);
  console.log("setup");
  // Check if we are at the root URL
  if (window.location.pathname === "/" && !window.location.hash) {
    // Load a random file if it's the root and no file is specified in the URL hash
    changeFile(randomInt(26));
  } else {
    // Otherwise, try to get the file from the URI hash
    const currentFileFromHash = window.location.hash.substring(1).split("/")[2]; // Strip the "#" from the hash
    console.log(currentFileFromHash);
    if (currentFileFromHash) {
      changeFile(currentFileFromHash);

      // Use the file specified in the hash
      //changeFileFromHash(currentFileFromHash);
    }
  }
}

// FILE LOADER FUNCTIONS
function changeFile(file) {
  reset();
  current_file = file;
  const loc = `${current_set}/${current_bank}/${current_file}`;
  const filename = `art/${loc}.js`;
  loadJS(filename);
  document.location.hash = loc;
}

function changeSet(set) {
  current_set = set;
  current_bank = 0;
  console.log(`changeSet: ${current_bank}`);
  // reset
  changeFile(0);
}

function changeBank(bank) {
  current_bank = bank;
  console.log(`changeBank: ${current_bank}`);
  changeFile(0);
}

function reset() {
  ctx.clearRect(0, 0, w, h);
  ctx2.clearRect(0, 0, w, h);
  ctx3.clearRect(0, 0, w, h);
  ctx.lineCap = "butt";
}

// INJECT JS ONTO PAGE
function loadJS(filename) {
  if (fileref !== undefined)
    document.getElementsByTagName("head")[0].removeChild(fileref);
  fileref = document.createElement("script");
  fileref.setAttribute("type", "text/javascript");
  fileref.setAttribute("src", filename);
  document.getElementsByTagName("head")[0].appendChild(fileref);
}
