# Bundled downtime calendar

Upstream: https://korap.ids-mannheim.de/gerrit/KorAP/Mojolicious-Plugin-DowntimeCalendar

Imported version: **0.02**

Imported commit: **c71f2b0d8b46dff209c8df6feae2934a0bf14b93**

The implementation is maintained upstream and copied into Kalamar so source
installations and Docker images use the same code without an extra installation
step. Activation through the Kalamar adapter remains optional.

The imported files are:

- `lib/Mojolicious/Plugin/DowntimeCalendar.pm`
- `lib/Mojolicious/Plugin/DowntimeCalendar/*.pm`
- `t/downtime-calendar/{calendar,hosts,plugin}.t` (upstream's `t/*.t`)
- `third-party/downtime-calendar/LICENSE` (upstream's `LICENSE`)

These files retain the upstream Perl licensing terms. Kalamar's own code keeps
its existing license. The bundled namespace is excluded from CPAN indexing by
Kalamar's distribution metadata, leaving it owned by the upstream distribution.

## Updating

1. Select a reviewed full commit in a clean upstream checkout and run its tests.
2. Copy the implementation files, the three tests and the license listed above.
   Remove any obsolete imported files and review upstream dependency changes.
3. Update the imported version and full commit here. Keep the runtime dependencies
   in Kalamar's `Makefile.PL` aligned with upstream.
4. Run Kalamar's complete `make test` suite, including `t/downtime-calendar/*.t`,
   and the regular image build and slimming checks.
5. Commit the import and provenance together in Kalamar. Do not edit bundled
   files independently; implement shared changes upstream and import them again.

No Git fetch or upstream checkout is needed when installing or running Kalamar.
