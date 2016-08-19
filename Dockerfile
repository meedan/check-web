FROM meedan/ruby

# install dependencies
ENV CHROMEDRIVER_VERSION 2.23
RUN apt-get update -qq && apt-get install -y wget inkscape imagemagick unzip libnss3 xvfb --no-install-recommends && rm -rf /var/lib/apt/lists/*
RUN gpg --keyserver ha.pool.sks-keyservers.net --recv-keys 6380DC428747F6C393FEACA59A84159D7001A4E5 \
  && curl -o /usr/local/bin/tini -fSL "https://github.com/krallin/tini/releases/download/v0.9.0/tini" \
  && curl -o /usr/local/bin/tini.asc -fSL "https://github.com/krallin/tini/releases/download/v0.9.0/tini.asc" \
  && gpg --verify /usr/local/bin/tini.asc \
  && rm /usr/local/bin/tini.asc \
  && chmod +x /usr/local/bin/tini
RUN wget http://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip \
  && unzip -d /usr/local/bin chromedriver_linux64.zip \
  && rm chromedriver_linux64.zip
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update -qq \
  && apt-get install -y google-chrome-stable

# install our testing system
WORKDIR /app/test
COPY ./test/Gemfile ./test/Gemfile.lock /app/test/
RUN gem install bundler && bundle install --jobs 20 --retry 5
ENV DISPLAY :99

# install our app
WORKDIR /app
COPY . /app

# startup
EXPOSE 3333
ENTRYPOINT ["tini", "--"]
CMD ["static", "-a", "0.0.0.0", "-p", "3333", "build/web"]
