//==========================================================================================
// AUDIO SETUP
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Change this to match your WASM file name (bubble.wasm)
const dspName = "bubble";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// Create the DSP node from the bubble WASM
bubble.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log("params: ", dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams;
    });

//==========================================================================================
// INTERACTIONS
//==========================================================================================

// flags so we only trigger once when crossing 90°
let hasTriggeredX = false;
let hasTriggeredY = false;
const ROT_THRESHOLD = 90; // degrees

function accelerationChange(accx, accy, accz) {
    // optional: use acceleration if you want more interactions
}

function rotationChange(rotx, roty, rotz) {
    if (!dspNode || audioContext.state === "suspended") return;

    // ---- X axis ----
    if (Math.abs(rotx) > ROT_THRESHOLD && !hasTriggeredX) {
        playAudio();       // bubble sound
        hasTriggeredX = true;
    }
    if (Math.abs(rotx) <= ROT_THRESHOLD) {
        hasTriggeredX = false;
    }

    // ---- Y axis ----
    if (Math.abs(roty) > ROT_THRESHOLD && !hasTriggeredY) {
        playAudio();       // bubble sound
        hasTriggeredY = true;
    }
    if (Math.abs(roty) <= ROT_THRESHOLD) {
        hasTriggeredY = false;
    }
}

function mousePressed() {
    // useful to wake up audio on first click
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
    // optional test:
    // playAudio();
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}

function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    // optional: also trigger sound on shake
    // playAudio();
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log("Min value:", exampleMinValue, "Max value:", exampleMaxValue);
    return [exampleMinValue, exampleMaxValue];
}

//==========================================================================================
// AUDIO INTERACTION
//==========================================================================================

function playAudio() {
    if (!dspNode) return;
    if (audioContext.state === "suspended") return;

    // CHANGE THIS ADDRESS to match the gate/trigger of your bubble patch
    // Check console output from dspNode.getParams() to find the right one.
    dspNode.setParamValue("/bubble/gate", 1);
    setTimeout(() => {
        dspNode.setParamValue("/bubble/gate", 0);
    }, 100);
}

//==========================================================================================
// END
//==========================================================================================
