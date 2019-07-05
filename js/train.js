

const app = new Vue({
    el:'#app',
    data:{
        status:false,
        classifier: null,
        featureExtractor: null,
        isBrowser:true,
        numOne: 0,
        numTwo:0,
        numThree: 0,
        numFour:0,
        numFive: 0,
        numSix:0,
    },
    methods:{
        init:function() {

            this.status = true;
            this.addButtonListeners();
            this.populateSources();
            document.querySelector('#text').innerText = "hello";
        },
                    
        addButtonListeners:function() {

          // video start
          document.querySelector("#start-video").addEventListener("click", this.startVideo, false);
          document.querySelector("#start-video").addEventListener("touchend", this.startVideo, false);
          document.querySelector('#addone').addEventListener("click", this.addOne, false);
          document.querySelector('#addtwo').addEventListener("click", this.addTwo, false);
          document.querySelector('#addthree').addEventListener("click", this.addThree, false);
          document.querySelector('#addfour').addEventListener("click", this.addFour, false);
          document.querySelector('#addfive').addEventListener("click", this.addFive, false);
          document.querySelector('#addsix').addEventListener("click", this.addSix, false);

          document.querySelector('#train').addEventListener("click", this.train, false);
          document.querySelector('#predict').addEventListener("click", this.predict, false);
          document.querySelector('#save').addEventListener("click", this.save, false);

        },

        populateSources:function() {

          var audioSelect = document.querySelector('select#audioSource');
          var videoSelect = document.querySelector('select#videoSource');

          navigator.mediaDevices.enumerateDevices().then(this.gotDevices).catch(this.handleError);

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
            
            video: {
              deviceId: {exact: videoSelect.value}
            }
          };

          document.querySelector('#text').innerText = "Asking permission";

          navigator.mediaDevices.getUserMedia(constraints).then(this.gotStream).catch(this.handleError);
      
          this.startClassifier();

        }, 
        
        gotStream:function(stream) {

          window.stream = stream; // make stream available to console
          var video = document.getElementById('video');
          video.srcObject = stream;

        },

        startVideo:function() {

          this.getStream();
          
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

        startClassifier:function() {

          document.querySelector('#text').innerText = "Loading model";

          this.featureExtractor = ml5.featureExtractor('MobileNet', this.modelLoaded);
          this.featureExtractor.numClasses = 4;
          var video = document.getElementById('video');
          this.classifier = this.featureExtractor.classification(video, { epochs:30, learningRate: 0.001, numLabels: 4 }, this.videoReady);


        },
        modelLoaded:function() {
          console.log('Model loaded!');
          document.querySelector('#text').innerText = "Model loaded"
          //this.classifier.load("models/model.json", this.customModelLoaded);
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
          document.querySelector('#text').innerText = "Predicting...";

          this.classifier.classify(this.gotResults);
        },

        gotResults:function(err, results) {
          // Display any error
          if (err) {
            console.error(err);
          }
          if (results && results[0]) {
            console.log(results[0].label);
            document.querySelector('#text').innerText = "Result! " + results[0].label + " " + results[0].confidence;
          //  confidence.innerText = results[0].confidence;
          //this.classifier.classify(gotResults);
          }
        },

        addOne:function() {
          this.classifier.addImage('first');
          this.numOne++;
          document.querySelector('#text').innerText = "Add first ! " + this.numOne;


        },
        addTwo:function() {
          this.classifier.addImage('second');
          this.numTwo++;
          document.querySelector('#text').innerText = "add two !" + this.numTwo;


        },
        addThree:function() {
          this.classifier.addImage('third');
          this.numThree++;
          document.querySelector('#text').innerText = "Add three ! " + this.numThree;


        },
        addFour:function() {
          this.classifier.addImage('four');
          this.numFour++;
          document.querySelector('#text').innerText = "add four !" + this.numFour;


        },
        addFive:function() {
          this.classifier.addImage('five');
          this.numFive++;
          document.querySelector('#text').innerText = "Add five ! " + this.numFive;


        },
        addSix:function() {
          this.classifier.addImage('six');
          this.numSix++;
          document.querySelector('#text').innerText = "add six !" + this.numSix;


        },
        save:function() {
          this.classifier.save();
        }
    }
})





app.init();