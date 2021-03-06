// tslint:disable no-floating-promises
// tslint:disable no-console

import * as _ from 'lodash'
import * as path from 'path'
import * as Generator from 'yeoman-generator'
import yosay = require('yosay')

import {Options} from '../commands/hook'

const {version} = require('../../package.json')

class HookGenerator extends Generator {
  pjson!: any

  get _path() { return this.options.name.split(':').join('/') }
  get _ts() { return this.pjson.devDependencies.typescript }
  get _ext() { return this._ts ? 'ts' : 'js' }
  get _mocha() { return this.pjson.devDependencies.mocha }

  constructor(args: any, public options: Options) {
    super(args, options)
  }

  async prompting() {
    this.pjson = this.fs.readJSON('package.json')
    this.pjson.oclif = this.pjson.oclif || {}
    if (!this.pjson) throw new Error('not in a project directory')
    this.log(yosay(`Adding a ${this.options.event} hook to ${this.pjson.name} Version: ${version}`))
  }

  writing() {
    this.sourceRoot(path.join(__dirname, '../../templates'))
    this.fs.copyTpl(this.templatePath(`src/hook.${this._ext}.ejs`), this.destinationPath(`src/hooks/${this.options.event}/${this.options.name}.${this._ext}`), this)
    if (this._mocha) {
      this.fs.copyTpl(this.templatePath(`test/hook.test.${this._ext}.ejs`), this.destinationPath(`test/commands/${this._path}.test.${this._ext}`), this)
    }
    this.pjson.oclif = this.pjson.oclif || {}
    let hooks = this.pjson.oclif.hooks = this.pjson.oclif.hooks || {}
    let p = `./${this._ts ? 'lib' : 'src'}/hooks/${this.options.event}/${this.options.name}.js`
    if (hooks[this.options.event]) {
      hooks[this.options.event] = _.castArray(hooks[this.options.event])
      hooks[this.options.event].push(p)
    } else {
      this.pjson.oclif.hooks[this.options.event] = p
    }
    this.fs.writeJSON(this.destinationPath('./package.json'), this.pjson)
  }
}

export = HookGenerator
