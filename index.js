const postcss = require('postcss');
const cssjanus = require('cssjanus');

const commentRules = {
  noflip: '@noflip',
  swapLtrRtlInUrl: '@swapLtrRtlInUrl',
  swapLeftRightInUrl: '@swapLeftRightInUrl'
};

const regLeftRight = /(left|right)/;
const regJanusComments = new RegExp(`(${Object.values(commentRules).join('|')})`);

const checkPreviousComment = (node, comment) => {
  const prev = node ? node.prev() : null;
  return prev && prev.type === 'comment' && prev.toString().includes(comment) && prev.remove();
};

const getDeclarationsObject = (rule) => {
  const obj = {};
  rule.walkDecls(decl => obj[decl.prop] = { value: decl.value, important: decl.important} );
  return obj;
};

const cleanCssJanusComments = (rule) => {
  rule.walkComments(comment => {
    if (regJanusComments.test(comment.toString())) {
      comment.remove();
    }
  });
};

module.exports = postcss.plugin('postcss-janus', (options = {}) => async (css) => {

  const { prefixes = '.rtl', swapLtrRtlInUrl = false, swapLeftRightInUrl = false } = options;
  
  await css.walkRules(async rule => {
    
    if ( !checkPreviousComment(rule, commentRules.noflip) ) {
      
      const ruleStr = rule.toString();
      const ruleStrRtl = await cssjanus.transform(ruleStr, swapLtrRtlInUrl, swapLeftRightInUrl);
      const noRtlChanges = ruleStr === ruleStrRtl;
      const hasLtrRtlUrlDirectives = ruleStr.includes(commentRules.swapLtrRtlInUrl);
      const hasLeftRightUrlDirectives = ruleStr.includes(commentRules.swapLeftRightInUrl);

      if ( !noRtlChanges || hasLtrRtlUrlDirectives || hasLeftRightUrlDirectives ) {
        const root = postcss.parse(ruleStrRtl);
        const ruleRtl = root.first;

        const declLtrObject = getDeclarationsObject(rule);

        await ruleRtl.walkDecls((decl) => {
          if (declLtrObject[decl.prop] && declLtrObject[decl.prop].value === decl.value) {
            if (hasLtrRtlUrlDirectives || hasLeftRightUrlDirectives) {
              let urlInverted = '';
              if (checkPreviousComment(decl, commentRules.swapLtrRtlInUrl)) {
                urlInverted = cssjanus.transform(decl.value, true);
              } else if (checkPreviousComment(decl, commentRules.swapLeftRightInUrl)) {
                urlInverted = cssjanus.transform(decl.value, false, true);
              }
              if (urlInverted) {
                if (urlInverted === decl.value) {
                  decl.remove();
                } else {
                  decl.value = urlInverted;
                }
              } else {
                decl.remove();
              }
            } else {
              decl.remove();
            }            
          }
        });

        const declRtlObject = getDeclarationsObject(ruleRtl);
        let ruleRtlDeclQuantity = 0;

        ruleRtl.walkDecls((decl) => {
          ruleRtlDeclQuantity++;
          if (regLeftRight.test(decl.prop)) {
            const inverse = cssjanus.transform(decl.prop);
            if (!declRtlObject[inverse]) {
              const unsetDecl = postcss.decl({prop: inverse, value: 'unset', important: declRtlObject[decl.prop].important});
              decl.before(unsetDecl);
            }
          }
        });

        cleanCssJanusComments(rule);
        cleanCssJanusComments(ruleRtl);

        if (ruleRtlDeclQuantity) {          
          ruleRtl.selectors = typeof prefixes === 'string'
            ? ruleRtl.selectors.map((s, i) => `${i && '' || '\n'}${prefixes} ${s}`)
            : ruleRtl.selectors.reduce((ps, s) => {
              ps = ps.concat(prefixes.map((p, i) => `${i && '' || '\n'}${p} ${s}`));
              return ps;
            }, []);

          rule.after(ruleRtl);
        }        

      }

    }

  });

});
