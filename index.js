const postcss = require('postcss');
const cssjanus = require('cssjanus');

const regLeftRight = /(left|right)/;

const commentRules = {
  noflip: '@noflip',
  swapLtrRtlInUrl: '@swapLtrRtlInUrl',
  swapLeftRightInUrl: '@swapLeftRightInUrl'
};

const checkCommentRule = (node, comment) => {
  const prev = node ? node.prev() : null;
  return prev && prev.type === 'comment' && (new RegExp(comment)).test(prev.toString());
};

module.exports = postcss.plugin('postcss-janus', (options = {}) => async (css) => {

  const prefixes = options.prefixes || '.rtl';
  const swapLtrRtlInUrl = options.swapLtrRtlInUrl || false;
  const swapLeftRightInUrl = options.swapLeftRightInUrl || false;

  await css.walkRules(async (rule) => {

    if ( !checkCommentRule(rule, commentRules.noflip) ) {

      const declarations = [];
      const ltr = [];

      await rule.walkDecls(declaration => {

        if ( !checkCommentRule(declaration, commentRules.noflip) ) {

          const css = `${declaration.toString()};`;

          declarations.push(css);

          ltr.push({
            css,
            prop: declaration.prop,
            swapLtrRtlInUrl: (!swapLtrRtlInUrl && checkCommentRule(declaration, commentRules.swapLtrRtlInUrl)) || swapLtrRtlInUrl,
            swapLeftRightInUrl: (!swapLeftRightInUrl && checkCommentRule(declaration, commentRules.swapLeftRightInUrl)) || swapLeftRightInUrl,
            reset: regLeftRight.test(declaration.prop)
          });

        }

      });

      const rtl = ltr.map(obj => ({...obj, css: cssjanus.transform(obj.css, obj.swapLtrRtlInUrl, obj.swapLeftRightInUrl)}));
      const filtered = rtl.filter(obj => declarations.indexOf(obj.css) < 0);
      const rtlProps = filtered.map(obj => obj.prop);

      if (filtered.length) {

        const selector = rule.selector
            .split(',')
            .map(s => {
              const st = s.trim();
              return typeof prefixes === 'string'
                  ? `\n${ prefixes } ${ st }`
                  : prefixes.map(p => `\n${p} ${st}`)
            }).join(',');

        const reset = filtered.reduce((css, obj) => {
          if (obj.reset) {
            if ( rtlProps.indexOf(cssjanus.transform(obj.prop)) < 0 ) {
              css += `\n    ${ obj.prop }: unset;`;
            }
          }
          return css;
        }, '');

        const rtlCSS = filtered.reduce((css, obj) => {
          css += `    ${ obj.css }\n`;
          return css;
        }, '');

        await rule.after(`${ selector } {${reset}\n${rtlCSS}}`);

      }

    }

  });

});
