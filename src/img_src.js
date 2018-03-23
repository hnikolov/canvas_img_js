// Global variables
var image = new Image();
var canvas = null;
var context = null;
var canvas_ch_1 = null;
var context_ch_1 = null;

// Image data
var input = null;
var output = null;
var img_ch_1 = null;
var img_ch_2 = null;
var img_ch_3 = null;

// Alias some variables for convenience
// Notice that we should use input.width and input.height here
// as they might not be the same as canvas.width and canvas.height
// (in particular, they might be different on high-res displays)
var w; // input.width
var h; // input.height

// Basic functions TODO -------------------------------------
function toIndex(x, y) { // returns the index to the red pixel component
    return (x + y*w)*4; // zero-based, (r-g-b-a)
}

function getPixelGray(x, y) {
    //var i = toIndex(x,y);
    var i = (x + y*w)*4
    return 0.34 * input.data[i] + 0.5 * input.data[i+1] + 0.16 * input.data[i+2];
    return pxl;
}

function setPixelGray(x, y, val) {
    //var i = toIndex(x,y);
    var i = (x + y*w)
    output.data[i]   = val; // red
    output.data[i+1] = val; // green
    output.data[i+2] = val; // blue
}
// ----------------------------------------------------------

// Image processing functions -------------------------------
function invert() {
    for (var i=0;i<input.data.length;i+=4)
    {
        output.data[i]   = 255-input.data[i];   // red
        output.data[i+1] = 255-input.data[i+1]; // green
        output.data[i+2] = 255-input.data[i+2]; // blue
        //output.data[i+3] = 255; // alpha
    }   
}

function grayScale() {
//*    
    for (var i=0;i<input.data.length;i+=4)
    {
//      var brightness = (input.data[i] + input.data[i+1] + input.data[i+2]) / 3;
        var brightness = 0.34 * input.data[i] + 0.5 * input.data[i+1] + 0.16 * input.data[i+2];
              
        output.data[i]   = brightness; // red
        output.data[i+1] = brightness; // green
        output.data[i+2] = brightness; // blue 
    }
/*/
// TODO
    for (var i=0;i<w;i++) {
        for (var j=0;i<h;j++) {
            //var pxl = getPixel(i, j)
            setPixelGray(i, j, 128);
    }}    
//*/
}

function rotateColors() {
  for (var i=0;i<input.data.length;i+=4)
  {
    var temp = input.data[i];
          
    output.data[i]   = input.data[i+1]; // red   <- green
    output.data[i+1] = input.data[i+2]; // green <- blue
    output.data[i+2] = temp;            // blue  <- red
  }
}

// TODO: YUV; color converted space channels not needed?
function rgbChannels() {  
    img_ch_1 = context.getImageData(0, 0, canvas.width, canvas.height); 
    img_ch_2 = context.getImageData(0, 0, canvas.width, canvas.height); 
    img_ch_3 = context.getImageData(0, 0, canvas.width, canvas.height); 
    
    for (var i=0;i<output.data.length;i+=4)
    {
        img_ch_1.data[i]   = 0; // keep only the green channel
        img_ch_1.data[i+2] = 0;

        img_ch_2.data[i+1] = 0; // keep only the red channel
        img_ch_2.data[i+2] = 0;

        img_ch_3.data[i]   = 0; // keep only the blue channel
        img_ch_3.data[i+1] = 0;
    }
    context_ch_1.putImageData(img_ch_1, 0, 0);
    context_ch_2.putImageData(img_ch_2, 0, 0);
    context_ch_3.putImageData(img_ch_3, 0, 0);
}

function yuvChannels() {
    img_ch_1 = context.getImageData(0, 0, canvas.width, canvas.height); 
    img_ch_2 = context.getImageData(0, 0, canvas.width, canvas.height); 
    img_ch_3 = context.getImageData(0, 0, canvas.width, canvas.height); 
    
    for (var i=0;i<output.data.length;i+=4)
    {
        var R = img_ch_1.data[i];
        var G = img_ch_1.data[i+1];
        var B = img_ch_1.data[i+2];

        var Y =  (0.257 * R) + (0.504 * G) + (0.098 * B) + 16;  // Luminance
        var V =  (0.439 * R) - (0.368 * G) - (0.071 * B) + 128; // Cr (red difference)
        var U = -(0.148 * R) - (0.291 * G) + (0.439 * B) + 128; // Cb (blue difference)

        img_ch_1.data[i+1] = Y; // Use the green channel to show luminance information
        img_ch_1.data[i  ] = Y;
        img_ch_1.data[i+2] = Y;

        img_ch_2.data[i]   = V;
        img_ch_2.data[i+1] = 0; // keep only the red channel
        img_ch_2.data[i+2] = 0;

        img_ch_3.data[i+2] = U;
        img_ch_3.data[i]   = 0; // keep only the blue channel
        img_ch_3.data[i+1] = 0;
    }
    context_ch_1.putImageData(img_ch_1, 0, 0);
    context_ch_2.putImageData(img_ch_2, 0, 0);
    context_ch_3.putImageData(img_ch_3, 0, 0);
}

function edgeDetection() {
     for (var y = 1; y < h-1; y += 1) {
       for (var x = 1; x < w-1; x += 1) {
         for (var c = 0; c < 3; c += 1) { // r, g, b
           var i = (y*w + x)*4 + c;
           output.data[i] = 127 + -input.data[i - w*4 - 4] -   input.data[i - w*4] - input.data[i - w*4 + 4] +
                                  -input.data[i - 4]       + 8*input.data[i]       - input.data[i + 4] +
                                  -input.data[i + w*4 - 4] -   input.data[i + w*4] - input.data[i + w*4 + 4];
         }
         output.data[(y*w + x)*4 + 3] = 255; // alpha
       }
     }   
}

// TODO
function convColSpace() {
    for (var i=0;i<input.data.length;i+=4)
    {
        var brightness = 0.34 * input.data[i] + 0.5 * input.data[i+1] + 0.16 * input.data[i+2];
        
        output.data[i]   = (255 + (input.data[i]   - input.data[i+1])) >> 1; // red
        output.data[i+1] = (255 + (input.data[i+1] - input.data[i+2])) >> 1; // green
        output.data[i+2] = (255 + (input.data[i+2] - input.data[i]))   >> 1; // blue
//        output.data[i+3] = brightness;   
    }
}

// "Buttons" functions --------------------------------------
function btn_invert() { 
    input = context.getImageData(0, 0, canvas.width, canvas.height); // Prepare input data
    invert();                                                        // Process image
    context.putImageData(output, 0, 0);                              // Draw image to canvas
    rgbChannels();
}                                                                    

function btn_grayScale() {                                           
    input = context.getImageData(0, 0, canvas.width, canvas.height); // Prepare input data
    grayScale();                                                     // Process image
    context.putImageData(output, 0, 0);                              // Draw image to canvas
    rgbChannels();
}                                                                    

function btn_rotateColors() {                                        
    input = context.getImageData(0, 0, canvas.width, canvas.height); // Prepare input data
    rotateColors();                                                  // Process image
    context.putImageData(output, 0, 0);                              // Draw image to canvas
    rgbChannels();
}                                                                    

function btn_edgeDetection() {                                       
    input = context.getImageData(0, 0, canvas.width, canvas.height); // Prepare input data
    edgeDetection();                                                 // Process image
    context.putImageData(output, 0, 0);                              // Draw image to canvas
    rgbChannels();
}

function btn_convColSpace() {                                       
    input = context.getImageData(0, 0, canvas.width, canvas.height); // Prepare input data
    convColSpace();                                                  // Process image
    context.putImageData(output, 0, 0);                              // Draw image to canvas
    rgbChannels();
}

function btn_undo() {
    context.putImageData(input, 0, 0);
    rgbChannels();
}
