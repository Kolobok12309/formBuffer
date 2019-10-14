module.exports = {
    lines: 100,
    functions: 100,
    branches: 100,
    statements: 100,
    include: ['lib/**/*.ts'],
    exclude: ['dist/', 'tests/**/*', 'lib/**/*.d.ts'],
    reporter: ['lcov', 'text', 'html'],
    extension: ['.ts', '.js'],
    cache: true,
    all: true, // not only files used by tests, but all instrumented files
    sourceMap: false, // if using babel
    instrument: false, // if using babel
};
