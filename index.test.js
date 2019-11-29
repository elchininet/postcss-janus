const postcss = require('postcss');
const cssJanus = require('./');
const tests = require('./index.testdata');

async function run (input, output, opts) {
  let result = await postcss([cssJanus(opts)]).process(input, { from: undefined });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
}

tests.forEach((test) => {

  it(test.name, async () => {
    await run(test.input, test.output, test.options);
  });

});
