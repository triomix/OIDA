FROM beevelop/cordova
RUN mkdir /tmp/src
COPY src /tmp/src
RUN cordova create oida
WORKDIR /tmp/oida/
RUN ls 
RUN pwd
RUN cordova platform add browser
#RUN cordova platform add android
#RUN cordova plugin add https://github.com/apache/cordova-plugin-camera.git
RUN cp -R /tmp/src/* /tmp/oida/www
WORKDIR /tmp/oida/www

EXPOSE 8000

CMD  cordova run browser

