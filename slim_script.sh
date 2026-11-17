#!/bin/sh
# One slimming entry point for local builds and GitLab CI.
set -eu
VERSION=${1:-$(git describe --tags --abbrev=0 2>/dev/null || echo latest)}
SLIM_IMAGE=${SLIM_IMAGE:-mintoolkit/mint}
full_image="korap/kalamar:${VERSION}-large"
slim_image="korap/kalamar:${VERSION}"

# Keep every installed Perl library/data directory, not only the files touched
# by a probe. Locale, Unicode and timezone resources are loaded lazily.
paths=$(docker run --rm --entrypoint perl "$full_image" script/check-runtime --paths)
set -- --http-probe=true \
  --exec='perl Makefile.PL && MOJO_MODE=test make test && perl script/check-runtime --manifest /kalamar/runtime-manifest.json && unzip -v' \
  --include-workdir=true \
  --exclude-pattern=/tmp/chi-driver-fastmmap \
  '--exclude-pattern=/tmp/chi-driver-fastmmap/**' \
  --tag "$slim_image" --tag korap/kalamar:latest
while IFS= read -r directory; do
  [ -n "$directory" ] && set -- "$@" "--include-path=$directory"
done <<PATHS
$paths
PATHS
# The old host slim binary uses a Docker API unsupported by newer daemons.
# The same containerized Mint invocation is used locally and in CI.
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  "$SLIM_IMAGE" --crt-api-version 1.46 build "$@" "$full_image"
# Never publish an image just because the optimization command returned: check
# its language resources in a fresh runtime process.
docker run --rm --entrypoint perl "$slim_image" script/check-runtime \
  --manifest /kalamar/runtime-manifest.json
