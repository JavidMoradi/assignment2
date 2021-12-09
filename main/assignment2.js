var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

var bridgeId = 11;

var behindLeftUpperLegId = 12;
var behindLeftLowerLegId = 13;
var behindRightUpperLegId = 14;
var behindRightLowerLegId = 15;

var torsoHeight = 5.0;
var torsoWidth = 2.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;
var upperLegWidth = 0.5;
var lowerLegWidth = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;

var bridgeHeight = 4.0;
var bridgeWidth = 1.0;

var numNodes = 16;
// var numAngles = 11;
var numAngles = 15; // bridge is excluded
var angle = 0;

// angles for: camera/torso, 
//  head, 
//  left upper arm,
//  left lower arm,
//  right upper arm,
//  right lower arm,
//  front left upper leg,
//  front left lower leg,
//  front right upper leg,
//  front right lower leg,
//  head,
//  bridge,
//  behind left upper leg,
//  behind left lower leg,
//  behind right upper leg,
//  behind right lower leg,  
var theta = [-160, 0, 170, -20, 170, -20, 180, 0, 180, 0, 0, -90, 180, 0, 180, 0];

// var numVertices = 24;
var numVertices = 36;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++) {
    figure[i] = createNode(null, null, null, null);
}

var vBuffer;
var modelViewLoc;

var pointsArray = [];

var flag = false;
var armFlag = false;
var toeFlag = false;

var saveTheta = [];

//-------------------------------------------
function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------
function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}

function initNodes(Id) {
    var m = mat4();

    switch (Id) {

        case torsoId:
            m = rotate(theta[torsoId], 0, 1, 0);
            figure[torsoId] = createNode(m, torso, null, headId);
            break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(theta[head1Id], 1, 0, 0))
            m = mult(m, rotate(theta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, leftUpperArmId, null);
            break;

        case leftUpperArmId:
            m = translate(-(torsoWidth + upperArmWidth), 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
            figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId);
            break;

        case rightUpperArmId:
            m = translate(torsoWidth + upperArmWidth, 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
            figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId);
            break;

        case leftUpperLegId:
            m = translate(-(torsoWidth + upperLegWidth), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperLegId], 1, 0, 0));
            figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId);
            break;

        case rightUpperLegId:
            // m = translate(torsoWidth + upperLegWidth, 0.1 * upperLegHeight, 0.0);
            // m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
            // figure[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId);
            // break;
            m = translate(torsoWidth + upperLegWidth, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
            figure[rightUpperLegId] = createNode(m, rightUpperLeg, bridgeId, rightLowerLegId);
            break;

        case leftLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
            figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
            break;

        case rightLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
            figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
            break;

        case leftLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
            figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
            break;

        case rightLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
            figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
            break;

        //...
        case bridgeId:
            m = rotate(theta[bridgeId], 1, 0, 0);
            figure[bridgeId] = createNode(m, bridge, behindLeftUpperLegId, null);
            break;

        case behindLeftUpperLegId:
            m = translate(-(torsoWidth + upperLegWidth), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[behindLeftUpperLegId], 1, 0, 0));
            figure[behindLeftUpperLegId] = createNode(m, behindLeftUpperLeg, behindRightUpperLegId, behindLeftLowerLegId);
            break;
        
        case behindRightUpperLegId:
            m = translate(torsoWidth + upperLegWidth, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[behindRightUpperLegId], 1, 0, 0));
            figure[behindRightUpperLegId] = createNode(m, behindRightUpperLeg, null, behindRightLowerLegId);
            break;

        case behindLeftLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[behindLeftLowerLegId], 1, 0, 0));
            figure[behindLeftLowerLegId] = createNode(m, behindLeftLowerLeg, null, null);
            break;

        case behindRightLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[behindRightLowerLegId], 1, 0, 0));
            figure[behindRightLowerLegId] = createNode(m, behindRightLowerLeg, null, null);
            break;
    }
}

function traverse(Id) {
    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function bridge() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * bridgeHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(bridgeWidth, bridgeHeight, bridgeWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function behindLeftUpperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, bridgeHeight));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function behindLeftLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, bridgeHeight));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));    
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function behindRightUpperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, bridgeHeight));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function behindRightLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, bridgeHeight));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
}

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();
    
    projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 10.0);
    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    document.getElementById("slider0").onchange = function () {
        theta[torsoId] = event.srcElement.value;
        initNodes(torsoId);
    };
    document.getElementById("slider1").onchange = function () {
        theta[head1Id] = event.srcElement.value;
        initNodes(head1Id);
    };
    document.getElementById("slider2").onchange = function () {
        theta[leftUpperArmId] = event.srcElement.value;
        initNodes(leftUpperArmId);
    };
    document.getElementById("slider3").onchange = function () {
        theta[leftLowerArmId] = event.srcElement.value;
        initNodes(leftLowerArmId);
    };
    document.getElementById("slider4").onchange = function () {
        theta[rightUpperArmId] = event.srcElement.value;
        initNodes(rightUpperArmId);
    };
    document.getElementById("slider5").onchange = function () {
        theta[rightLowerArmId] = event.srcElement.value;
        initNodes(rightLowerArmId);
    };
    document.getElementById("slider6").onchange = function () {
        theta[leftUpperLegId] = event.srcElement.value;
        initNodes(leftUpperLegId);
    };
    document.getElementById("slider7").onchange = function () {
        theta[leftLowerLegId] = event.srcElement.value;
        initNodes(leftLowerLegId);
    };
    document.getElementById("slider8").onchange = function () {
        theta[rightUpperLegId] = event.srcElement.value;
        initNodes(rightUpperLegId);
    };
    document.getElementById("slider9").onchange = function () {
        theta[rightLowerLegId] = event.srcElement.value;
        initNodes(rightLowerLegId);
    };
    document.getElementById("slider10").onchange = function () {
        theta[head2Id] = event.srcElement.value;
        initNodes(head2Id);
    };
    document.getElementById("slider11").onchange = function() {
        theta[behindLeftLowerLegId] = event.srcElement.value;
        initNodes(behindLeftLowerLegId);
    };
    document.getElementById("slider12").onchange = function() {
        theta[behindLeftUpperLegId] = event.srcElement.value;
        initNodes(behindLeftUpperLegId);
    };
    document.getElementById("slider13").onchange = function() {
        theta[behindRightLowerLegId] = event.srcElement.value;
        initNodes(behindRightLowerLegId);
    };
    document.getElementById("slider14").onchange = function() {
        theta[behindRightUpperLegId] = event.srcElement.value;
        initNodes(behindRightUpperLegId);
    };
    document.getElementById("headButton").addEventListener("click", function() {
        flag = !flag;
        console.log(flag);
    });
    document.getElementById("armButton").addEventListener("click", function() {
        armFlag = !armFlag;
    });
    document.getElementById("save").addEventListener("click", function() {
        saveTheta = [];
        for (let i = 0; i < theta.length; i++) {
            saveTheta.push(theta[i])
        }
        console.log(saveTheta);
        alert("Current Keyframe has been saved");
    });
    document.getElementById("load").addEventListener("click", function() {
        console.log("theta before: " + theta);
        theta = saveTheta;
        console.log("theta after" + theta);
        initNodes(torsoId);
        initNodes(head1Id);
        initNodes(leftUpperArmId);
        initNodes(leftLowerArmId);
        initNodes(rightUpperArmId);
        initNodes(rightLowerArmId);
        initNodes(leftUpperLegId);
        initNodes(leftLowerLegId);
        initNodes(rightUpperLegId);
        initNodes(rightLowerLegId);
        initNodes(head2Id);
        initNodes(behindLeftLowerLegId);
        initNodes(behindLeftUpperLegId);
        initNodes(behindRightLowerLegId);
        initNodes(behindRightUpperLegId);
        initNodes(bridgeId);
    });
    document.getElementById("toeButton").addEventListener("click", function() {
        toeFlag = !toeFlag;
    });

    for (i = 0; i < numNodes; i++)
        initNodes(i);

    render();
}

var up = true;
var down = false;

var lowerPart = false;

var left = true;
var right = false;
var otherHand = false;
var l = true;
var r = false;

var toePart = false;
var secondToe = false;
var up = true;
var down = false;
var u = true;
var d = false;
var cond = false;

var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (flag) {
        if (up) {
            theta[head1Id] -= 1;
            initNodes(head1Id);
            if (theta[head1Id] == -30) {
                up = false;
                down = true;
            }
        }
        else if (down) {
            theta[head1Id] += 1;
            initNodes(head1Id);
            if (theta[head1Id] == 0) {
                up = true;
                down = false;
            }
        }
    }

    if (armFlag) {
        if (theta[leftUpperArmId] % 360 != 160) {
            if (theta[leftUpperArmId] > 160) {
                theta[leftUpperArmId] -= 1;
                initNodes(leftUpperArmId);
            } else {
                theta[leftUpperArmId] = theta[leftUpperArmId] % 220;
                theta[leftUpperArmId] += 1;
                initNodes(leftUpperArmId);
            }
        }
        if (theta[rightUpperArmId] % 360 != 160) {
            if (theta[rightUpperArmId] > 160) {
                theta[rightUpperArmId] -= 1;
                initNodes(rightUpperArmId);
            } else {
                theta[rightUpperArmId] = theta[rightUpperArmId] % 220;
                theta[rightUpperArmId] += 1;
                initNodes(rightUpperArmId);
            }
        }

        if ((theta[rightUpperArmId] % 360) == 160 && (theta[leftUpperArmId] % 360) == 160) {
            lowerPart = true;
            theta[leftLowerArmId] = theta[leftLowerArmId] % 360;
        }

        if (lowerPart) {
            if (!otherHand) {
                if (left && theta[leftLowerArmId] >= -150) {
                    if (theta[leftLowerArmId] == -150) {
                        right = true;
                        left = false;
                    }

                    theta[leftLowerArmId] -= 1;
                    initNodes(leftLowerArmId);
                }
                if (right && theta[leftLowerArmId] <= 0) {
                    if (theta[leftLowerArmId] == 0) {
                        left = true;
                        right = false;
                        otherHand = true;
                    }
                    
                    theta[leftLowerArmId] += 1;
                    initNodes(leftLowerArmId);
                }
            }
            else if (otherHand) {
                if (l && theta[rightLowerArmId] >= -150) {
                    if (theta[rightLowerArmId] == -150) {
                        r = true;
                        l = false;
                    }

                    theta[rightLowerArmId] -= 1;
                    initNodes(rightLowerArmId);
                }
                if (r && theta[rightLowerArmId] <= 0) {
                    if (theta[rightLowerArmId] == 0) {
                        l = true;
                        r = false;
                        otherHand = false;
                    }
                    
                    theta[rightLowerArmId] += 1;
                    initNodes(rightLowerArmId);
                }
            }
        }
    }

    if (toeFlag) {
        if (!cond) {
            if (theta[leftUpperLegId] % 360 != 180) {
                if (theta[leftUpperLegId] > 180) {
                    theta[leftUpperLegId] -= 1;
                    initNodes(leftUpperLegId);
                } else {
                    theta[leftUpperLegId] = theta[leftUpperLegId] % 250;
                    theta[leftUpperLegId] += 1;
                    initNodes(leftUpperLegId);
                }
            }
            if (theta[rightUpperLegId] % 360 != 180) {
                if (theta[rightUpperLegId] > 180) {
                    theta[rightUpperLegId] -= 1;
                    initNodes(rightUpperLegId);
                } else {
                    theta[rightUpperLegId] = theta[rightUpperLegId] % 250;
                    theta[rightUpperLegId] += 1;
                    initNodes(rightUpperLegId);
                }
            }
        }

        if ((theta[rightUpperLegId] % 360) == 180 && (theta[leftUpperLegId] % 360) == 180) {
            toePart = true;
            cond = true;
        }

        if (toePart) {
            if (!secondToe) {
                if (up && theta[leftLowerLegId] <= 150) {
                    if (theta[leftLowerLegId] == 150) {
                        up = false;
                        down = true;
                    }

                    theta[leftLowerLegId] += 1;
                    theta[leftUpperLegId] -= 0.5;
                    initNodes(leftLowerLegId);
                    initNodes(leftUpperLegId);
                    console.log(theta[leftLowerLegId]);
                    console.log(theta[leftUpperLegId]);
                }
                if (down && theta[leftLowerLegId] >= 0) {
                    if (theta[leftLowerLegId] == 0) {
                        up = true;
                        down = false;
                        secondToe = true;
                    }
                    
                    theta[leftLowerLegId] -= 1;
                    theta[leftUpperLegId] += 0.5;
                    initNodes(leftLowerLegId);
                    initNodes(leftUpperLegId);
                }
            }
            else if (secondToe) {
                if (u && theta[rightLowerLegId] <= 150) {
                    if (theta[rightLowerLegId] == 150) {
                        u = false;
                        d = true;
                    }

                    theta[rightLowerLegId] += 1;
                    theta[rightUpperLegId] -= 0.5;
                    initNodes(rightUpperLegId);
                    initNodes(rightLowerLegId);
                }
                if (d && theta[rightLowerLegId] >= 0) {
                    if (theta[rightLowerLegId] == 0) {
                        u = true;
                        d = false;
                        secondToe = false;
                    }
                    
                    theta[rightLowerLegId] -= 1;
                    theta[rightUpperLegId] += 0.5;
                    initNodes(rightUpperLegId);
                    initNodes(rightLowerLegId);
                }
            }
        }
    }

    traverse(torsoId);
    requestAnimFrame(render);
}