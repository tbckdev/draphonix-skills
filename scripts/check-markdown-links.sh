#!/bin/bash
# check-markdown-links.sh — fail on non-portable local links and missing relative markdown targets

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

had_error=0

while IFS= read -r file; do
  if ! perl - "$file" <<'PERL'
use strict;
use warnings;
use File::Basename qw(dirname);
use File::Spec;

my $file = shift @ARGV;
open my $fh, '<', $file or die "cannot open $file: $!";

my $had_error = 0;
my $line_no = 0;

while (my $line = <$fh>) {
  $line_no++;
  while ($line =~ /\[[^\]]+\]\(([^)]+)\)/g) {
    my $target = $1;
    $target =~ s/\s+$//;
    $target =~ s/\s+"[^"]*"$//;

    next if $target =~ m{^(?:https?://|mailto:|#)};
    next if $target =~ /(?:<[^>]+>|YYYYMMDD-|^\{.+\}$)/;

    if ($target =~ m{^/}) {
      print STDERR "$file:$line_no: non-portable absolute link target: $target\n";
      $had_error = 1;
      next;
    }

    my $path_target = $target;
    $path_target =~ s/#.*$//;
    next if $path_target eq q{};

    my $resolved = File::Spec->canonpath(
      File::Spec->catfile(dirname($file), $path_target)
    );

    if (!-e $resolved) {
      print STDERR "$file:$line_no: missing relative link target: $target\n";
      $had_error = 1;
    }
  }
}

close $fh;
exit $had_error;
PERL
  then
    had_error=1
  fi
done < <(rg --files -g '*.md')

if [[ "$had_error" -ne 0 ]]; then
  exit 1
fi

echo "Markdown link validation passed"
