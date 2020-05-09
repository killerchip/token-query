module.exports = function (plop) {
  // controller generator
  plop.setGenerator('Functional Component', {
    description: 'react FC component in TS',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'component name'
      },
      {
        type: 'input',
        name: 'path',
        message: 'target folder path',
        default: 'src'
      }
    ],
    actions: [
      {
        type: 'add',
        path: '{{path}}/{{pascalCase name}}.tsx',
        templateFile: 'plops/functionalComponent.hbs'
      }
    ]
  });
};
