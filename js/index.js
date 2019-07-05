/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function modelLoaded() {
    console.log('Model loaded!');
}
// Predict the current frame.
function predict() {
    classifier.predict(gotResults);
}




// Show the results
function gotResults(err, results) {
    // Display any error
    if (err) {
        console.error(err);
    }
    if (results && results[0]) {
        result.innerText = results[0].label;
        confidence.innerText = results[0].confidence;
        classifier.classify(gotResults);
        console.log(results[0].label);
    }
}

const app = new Vue({
    el:'#app',
    data:{
        status:false,
        classifier: null,
        featureExtractor: null,
        isBrowser:false,
        numOne: 0,
        numTwo:0
    },
    methods:{
        init:function() {

            this.status = true;
            this.addButtonListeners();
            this.populateSources();
            this.startClassifier();

            document.querySelector('#text').innerText = "hello";
        },
                    
        addButtonListeners:function() {

          // video start
          document.querySelector("#start-video").addEventListener("click", this.startVideo, false);
          document.querySelector("#start-video").addEventListener("touchend", this.startVideo, false);
          document.querySelector('#addone').addEventListener("click", this.addOne, false);
          document.querySelector('#addtwo').addEventListener("click", this.addTwo, false);

          document.querySelector('#train').addEventListener("click", this.train, false);
          document.querySelector('#predict').addEventListener("click", this.predict, false);
          document.querySelector('#save').addEventListener("click", this.save, false);

        },

        populateSources:function() {
          var audioSelect = document.querySelector('select#audioSource');
          var videoSelect = document.querySelector('select#videoSource');

          navigator.mediaDevices.enumerateDevices().then(this.gotDevices).then(this.getStream).catch(this.handleError);

          audioSelect.onchange = this.getStream;
          videoSelect.onchange = this.getStream;
        },
        handleError:function(error) {
          console.log('Error: ', error);
          document.querySelector('#text').innerText = error;

        },

        gotDevices:function(deviceInfos) {


          var audioSelect = document.querySelector('select#audioSource');
          var videoSelect = document.querySelector('select#videoSource');

          for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            var option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput') {
              option.text = deviceInfo.label ||
                'microphone ' + (audioSelect.length + 1);
              audioSelect.appendChild(option);
            } else if (deviceInfo.kind === 'videoinput') {
              option.text = deviceInfo.label || 'camera ' +
                (videoSelect.length + 1);
              videoSelect.appendChild(option);
            } else {
              console.log('Found one other kind of source/device: ', deviceInfo);
            }
          }
        },

        getStream:function(){

          var audioSelect = document.querySelector('select#audioSource');
          var videoSelect = document.querySelector('select#videoSource');

          if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
              track.stop();
            });
          }
        
          var constraints = {
            audio: {
              deviceId: {exact: audioSelect.value}
            },
            video: {
              deviceId: {exact: videoSelect.value}
            }
          };
          document.querySelector('#text').innerText = "GET video";

          navigator.mediaDevices.getUserMedia(constraints).
            then(this.gotStream).catch(this.handleError);
        }, 
        
        gotStream:function(stream) {
          window.stream = stream; // make stream available to console

          var video = document.getElementById('video');
          video.srcObject = stream;

        },

        startVideo:function() {
                    
          console.log("Starting video capture");
          document.querySelector('#text').innerText = "Starting video capture";
          var video = document.getElementById('video');
          const constraints = {
            video: {
              deviceId: {exact: 1}
            }
        };

          if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: constraints }).then(stream => {
              video.srcObject = stream;
              //video.play();
            });
          } else {
            console.log("what the fuck");
            
          }
          /*
          var srcType = Camera.PictureSourceType.CAMERA;
          var options = this.setVideoOptions(srcType);            
          navigator.camera.getPicture(this.onVideoSuccess, this.onVideoError, options);
          */
          // Create a webcam capture
          this.startClassifier();

        },
        play:function() {
          var video = document.getElementById('video');
          video.play();

        },
        setVideoOptions:function(srcType) {

          let options = {
            // Some common settings are 20, 50, and 100
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: srcType,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.CAMERA,
            allowEdit: false,
            correctOrientation: true  //Corrects Android orientation quirks
          }
          return options;

        },

        onVideoSuccess:function(imageUri) {
            console.log("Video capture sucess");
            console.log("imageUri" + imageUri);
            this.displayImage(imageUri);
        },
        onVideoError:function() {
          console.log("Unable to obtain picture: " + error, "app");
        },
        displayImage:function(imgUri) {

          /*
          if(!this.isBrowser) {
            console.log("Display Image");
          let elem = document.getElementById('image');
            elem.src = imgUri;

          } else {
            
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");

            var image = new Image();
            image.onload = function() {
              ctx.drawImage(image, 0, 0);
            };
            image.src = "data:image/jpg;base64,"+imgUri;

            this.classifier.addImage(image, 'one');
            this.classifier.addImage(image, 'one');
            this.classifier.addImage(image, 'one');

            this.classifier.train();
            this.classifier.classify(image, (err, result) => {

              if (err)  
                console.log(err);
                else {
              // this should be labels
              console.log('rating: ' + result);
                }
            
            });

           // image.src = imgUri;
          }


         // this.train();

        

          /*
          var canvas = document.getElementById("canvas");
          var ctx = canvas.getContext("2d");

          var image = new Image();
          image.onload = function() {
            ctx.drawImage(image, 0, 0);
          };
          i//mage.src = "data:image/jpg;base64,"+imgUri;
          image.src = imgUri;

          */

          /*
          this.classifier.addImage(image, 'one', function() {
            console.log("all done");
          });

          */

        },

        startClassifier:function() {

          this.featureExtractor = ml5.featureExtractor('MobileNet', this.modelLoaded);
          var video = document.getElementById('video');
          this.classifier = this.featureExtractor.classification(video, this.videoReady);


        },
        modelLoaded:function() {
          console.log('Model loaded!');
          document.querySelector('#text').innerText = "Model loaded";
          this.classifier.load("models/model.json", this.customModelLoaded);
        },

        customModelLoaded:function() {
          console.log('Custom Model loaded!');
          document.querySelector('#text').innerText = "Custom loaded";

        },
        videoReady:function() {
          console.log("video ready");
        },

        train:function() {
          this.classifier.train(function(lossValue) {
            if (lossValue) {
              console.log('Loss: ' + lossValue);
              document.querySelector('#text').innerText = "lossValue! " + lossValue;
            } else {
              console.log('Done Training! Final Loss: ');
              document.querySelector('#text').innerText = "DONE";
            }
          });
        },
        predict:function() {
          this.classifier.classify(this.gotResults);
        },

        gotResults:function(err, results) {
          // Display any error
          if (err) {
            console.error(err);
          }
          if (results && results[0]) {
            console.log(results[0].label);
            document.querySelector('#text').innerText = "Result! " + results[0].label;
          //  confidence.innerText = results[0].confidence;
          //this.classifier.classify(gotResults);
          }
        },

        addOne:function() {
          this.classifier.addImage('one');
          this.numOne++;
          document.querySelector('#text').innerText = "Add one ! " + this.numOne;


        },
        addTwo:function() {
          this.classifier.addImage('two');
          this.numTwo++;
          document.querySelector('#text').innerText = "add two !" + this.numTwo;


        },
        save:function() {
          this.classifier.save();
        }
    }
})




/*
//----------- ML stuff
// Grab all the DOM elements
var video = document.getElementById('video');
var videoStatus = document.getElementById('videoStatus');
var loading = document.getElementById('loading');
var catButton = document.getElementById('catButton');
var dogButton = document.getElementById('dogButton');
var amountOfCatImages = document.getElementById('amountOfCatImages');
var amountOfDogImages = document.getElementById('amountOfDogImages');
var train = document.getElementById('train');
var loss = document.getElementById('loss');
var result = document.getElementById('result');
var confidence = document.getElementById('confidence');
var predict = document.getElementById('predict');

// A variable to store the total loss
let totalLoss = 0;

// Create a webcam capture
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })

// A function to be called when the model has been loaded
function modelLoaded() {
  loading.innerText = 'Model loaded!';
}



// Predict the current frame.
function predict() {
  classifier.predict(gotResults);
}

// A function to be called when the video is finished loading
function videoReady() {
  videoStatus.innerText = 'Video ready!';
}

// When the Cat button is pressed, add the current frame
// from the video with a label of cat to the classifier
catButton.onclick = function () {
  classifier.addImage('cat');
  amountOfCatImages.innerText = Number(amountOfCatImages.innerText) + 1;
}

// When the Cat button is pressed, add the current frame
// from the video with a label of cat to the classifier
dogButton.onclick = function () {
  classifier.addImage('dog');
  amountOfDogImages.innerText = Number(amountOfDogImages.innerText) + 1;
}

// When the train button is pressed, train the classifier
// With all the given cat and dog images
train.onclick = function () {
  classifier.train(function(lossValue) {
    if (lossValue) {
      totalLoss = lossValue;
      loss.innerHTML = 'Loss: ' + totalLoss;
    } else {
      loss.innerHTML = 'Done Training! Final Loss: ' + totalLoss;
    }
  });
}

// Show the results
function gotResults(err, results) {
  // Display any error
  if (err) {
    console.error(err);
  }
  if (results && results[0]) {
    result.innerText = results[0].label;
    confidence.innerText = results[0].confidence;
    classifier.classify(gotResults);
  }
}

// Start predicting when the predict button is clicked
predict.onclick = function () {
  classifier.classify(gotResults);
}

*/

//document.addEventListener('deviceready', app.init);
app.init();