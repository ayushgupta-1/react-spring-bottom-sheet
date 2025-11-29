module.exports = {
  branches: ['main'],
  preset: 'angular',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        tarballDir: null, // no need to store .tgz locally unless you want it
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: ['dist/**/*', 'CHANGELOG.md'], // optional: attach dist files to GitHub release
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
}
