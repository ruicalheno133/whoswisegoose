#!/bin/bash

input="wwg_questions.json"
output="questions_with_ids.json"

jq -c '.[]' "$input" | while read -r item; do
  uuid=$(uuidgen)
  echo "$item" | jq --arg uuid "$uuid" '. + {qid: $uuid}'
done | jq -s '.' > "$output"