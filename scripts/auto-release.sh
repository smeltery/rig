#!/usr/bin/env bash
# Hab's patch-tag + explicit workflow dispatch, restricted to the tested HEAD.
set -euo pipefail
git fetch origin main --tags
head="$(git rev-parse HEAD)"
if [[ "$head" != "$(git rev-parse origin/main)" ]]; then
  echo "Main has advanced; its own CI run will release it."
  exit 0
fi
stable_tags() { git tag "$@" | awk '/^v[0-9]+\.[0-9]+\.[0-9]+$/' | sort -V; }
tag="$(stable_tags --points-at "$head" | tail -n 1)"
if [[ -z "$tag" ]]; then
  latest="$(stable_tags --list | tail -n 1)"
  if [[ -z "$latest" ]]; then
    tag=v0.1.0
  else
    tag="${latest%.*}.$((${latest##*.} + 1))"
  fi
  git tag "$tag" "$head"
  git push origin "$tag"
fi
# GITHUB_TOKEN tag pushes do not trigger other workflows. Dispatch explicitly;
# repeating a failed auto-release run also recovers a failed dispatch.
if gh release view "$tag" >/dev/null 2>&1; then
  echo "$tag is already published."
else
  gh workflow run release.yml --ref main -f tag="$tag"
fi
