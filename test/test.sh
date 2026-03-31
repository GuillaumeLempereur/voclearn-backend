#!/bin/sh

#getDeck request
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"nb_words":20}' \
  http://localhost:5000/getDeck

#curl --header "Content-Type: application/json" --request POST --data '{"nb_words":50}' http://localhost:5000/getDeck
