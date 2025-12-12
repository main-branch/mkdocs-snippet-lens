# Change Log

All notable changes to the "mkdocs-snippet-lens" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.4](https://github.com/main-branch/mkdocs-snippet-lens/compare/v0.0.3...v0.0.4) (2025-12-12)


### Bug Fixes

* Add missing allowed endpoints to publish workflow ([688173d](https://github.com/main-branch/mkdocs-snippet-lens/commit/688173ddfb458d055c265dbcd62625e30ffa8463))


### Documentation

* Fix CI badge to reference correct workflow file ([7ec5936](https://github.com/main-branch/mkdocs-snippet-lens/commit/7ec5936030b4224b08761f4d32da1328ed563141))


### Miscellaneous Chores

* Update dev dependencies to latest versions ([924aea9](https://github.com/main-branch/mkdocs-snippet-lens/commit/924aea9bc648878dc8bf77f1d92f821f45c5c01e))

## [0.0.3](https://github.com/main-branch/mkdocs-snippet-lens/compare/v0.0.2...v0.0.3) (2025-12-12)


### Bug Fixes

* Make Publish Extension job idempotent ([0234f51](https://github.com/main-branch/mkdocs-snippet-lens/commit/0234f517de3e03a4164a41d3acadecaa28234f72))

## [0.0.2](https://github.com/main-branch/mkdocs-snippet-lens/compare/v0.0.1...v0.0.2) (2025-12-12)


### Features

* Add diagnostic error handling for missing snippet files ([e3ce8ae](https://github.com/main-branch/mkdocs-snippet-lens/commit/e3ce8ae3d419daf62da90b7ce63f88589de14584))
* Add PathResolver for snippet file path resolution ([08ae591](https://github.com/main-branch/mkdocs-snippet-lens/commit/08ae5915ddf9b82d6864e135e7c815d6398d9e43))
* Add SnippetDetector for MkDocs snippet syntax detection ([21b7c31](https://github.com/main-branch/mkdocs-snippet-lens/commit/21b7c31d9dcb288acda83ad4f0c5bf6ea11648ee))
* Add SnippetLinkProvider with layered testing architecture ([148b66a](https://github.com/main-branch/mkdocs-snippet-lens/commit/148b66ad775eea99291b5d178e1b422d0ef1e6ee))
* Add toggle command and configuration settings ([49f4af1](https://github.com/main-branch/mkdocs-snippet-lens/commit/49f4af133d53b336f4e908329c0b18b0536f5cc9))
* Enable automatic marketplace publishing ([3abf159](https://github.com/main-branch/mkdocs-snippet-lens/commit/3abf159f645eb15f81393620f8a9caea0c80a849))
* Implement PreviewManager for ghost text previews ([7e1909a](https://github.com/main-branch/mkdocs-snippet-lens/commit/7e1909aa6ad970b0ee9b5e4d9f523be051ccdbf8))
* Register SnippetLinkProvider in extension activation ([c0439ff](https://github.com/main-branch/mkdocs-snippet-lens/commit/c0439ff62ea60b1330516f5b0935869de581bf14))
* Render previews as indented block below snippet line ([7e1909a](https://github.com/main-branch/mkdocs-snippet-lens/commit/7e1909aa6ad970b0ee9b5e4d9f523be051ccdbf8))


### Bug Fixes

* **ci:** Compile tests before running unit tests ([cfb036b](https://github.com/main-branch/mkdocs-snippet-lens/commit/cfb036be357cbb1d5a50bcfbcc9235854822daeb))
* Correct ghost text preview and link underline bugs ([7e1909a](https://github.com/main-branch/mkdocs-snippet-lens/commit/7e1909aa6ad970b0ee9b5e4d9f523be051ccdbf8))
* Correct snippet link offset calculation ([7e1909a](https://github.com/main-branch/mkdocs-snippet-lens/commit/7e1909aa6ad970b0ee9b5e4d9f523be051ccdbf8))
* Handle duplicate snippet references correctly ([bb7b87e](https://github.com/main-branch/mkdocs-snippet-lens/commit/bb7b87eb4b345952eb629e920288cb8a4a0e6b46))
* Position ghost text after closing quote ([7e1909a](https://github.com/main-branch/mkdocs-snippet-lens/commit/7e1909aa6ad970b0ee9b5e4d9f523be051ccdbf8))


### Documentation

* Add contributing guidelines for PR workflow ([4af9d60](https://github.com/main-branch/mkdocs-snippet-lens/commit/4af9d60ded6c1d7592d4534d0af22c7b982acb77))
* Add planning documents ([3643228](https://github.com/main-branch/mkdocs-snippet-lens/commit/3643228beb2937d602a71fcb7cf467edeb06bc6f))
* Update guidance for TDD and test coverage ([f589812](https://github.com/main-branch/mkdocs-snippet-lens/commit/f589812d8389ebc8c818636a6e6910a9e50c0996))


### Code Refactoring

* **ci:** Rename workflow from ci.yml to continuous-integration.yml ([ddb9f46](https://github.com/main-branch/mkdocs-snippet-lens/commit/ddb9f46402068d2abb197afe18af319b043daef2))
* Extract inline formatting logic and improve build scripts ([7e1909a](https://github.com/main-branch/mkdocs-snippet-lens/commit/7e1909aa6ad970b0ee9b5e4d9f523be051ccdbf8))
* Extract preview content creation logic for better testability ([7e1909a](https://github.com/main-branch/mkdocs-snippet-lens/commit/7e1909aa6ad970b0ee9b5e4d9f523be051ccdbf8))
* Rename test directories to align with standard naming ([ee39591](https://github.com/main-branch/mkdocs-snippet-lens/commit/ee39591b0fed681e94a23015dbb58449aa25a7e0))


### Miscellaneous Chores

* Add husky configuration ([1cccdb2](https://github.com/main-branch/mkdocs-snippet-lens/commit/1cccdb23e0d8aa59e9c9d2717c1afbcda0130d78))
* Add markdown lint configuration ([bad193d](https://github.com/main-branch/mkdocs-snippet-lens/commit/bad193d2ff862bd49746beac9b3b57128ce2dd06))
* Enhance clean scripts to remove all build artifacts ([ff081f9](https://github.com/main-branch/mkdocs-snippet-lens/commit/ff081f936b36b48fcee564af74fea7a0e1003564))
* Initial project generated with yo ([5ada532](https://github.com/main-branch/mkdocs-snippet-lens/commit/5ada5321e8e519abebe882d7e5a56db3128a0341))
* Update repository to main-branch organization ([a38613f](https://github.com/main-branch/mkdocs-snippet-lens/commit/a38613f023c9d7553fea6d8ae4ab5fc930cc4c5a))


### Continuous Integration

* Add GitHub Actions CI workflow ([aec58f3](https://github.com/main-branch/mkdocs-snippet-lens/commit/aec58f3a296a352721bfd077cd91c07d293eee8b))
* Add release-please workflow for automated releases ([c11f6c6](https://github.com/main-branch/mkdocs-snippet-lens/commit/c11f6c60244de9cdfd4a6693516dbe7cb43dc19e))
* Optimize CI workflows and enforce conventional commits ([20e84db](https://github.com/main-branch/mkdocs-snippet-lens/commit/20e84db2c7433bad124a55d3d559c21ff64ce7d3))
* Trigger GitHub Actions to verify workflows ([b21e3fd](https://github.com/main-branch/mkdocs-snippet-lens/commit/b21e3fdda1611da10473254d40833a04533b557e))


### Tests

* Add code coverage reporting and fail build if coverage is below 100% ([c780b0d](https://github.com/main-branch/mkdocs-snippet-lens/commit/c780b0da7b2db1f8ca14c82f425cc66a4e4e3deb))
* Add tests documenting VS Code decoration API limitations ([7e1909a](https://github.com/main-branch/mkdocs-snippet-lens/commit/7e1909aa6ad970b0ee9b5e4d9f523be051ccdbf8))
* Configure coverage checking ([42e0c79](https://github.com/main-branch/mkdocs-snippet-lens/commit/42e0c79a7a9d501dd893a6c4ea9655e056430c47))
* Remove duplicate and non-functional tests ([002d28e](https://github.com/main-branch/mkdocs-snippet-lens/commit/002d28ecfa868e27b7a5a3e601cedd2c8fb2f7e1))

## [Unreleased]

- Initial release
