define(function (require) {
  return function FieldFormatClassProvider(config, $rootScope) {
    var _ = require('lodash');
    var angular = require('angular');

    function FieldFormat(params) {
      // give the constructor a more appropriate name
      this.type = this.constructor;

      // keep the params and defaults seperate
      this._params = params || {};
      this._paramDefaults = this.type.paramDefaults || {};

      // bind the public api
      this.convert = _.bind(this.convert, this);
      this.param = _.bind(this.param, this);
    }

    FieldFormat.initConfig = function (input) {
      return _.transform(input, function (params, val, key) {
        if (!_.isString(val) || val.charAt(0) !== '=') {
          params[key] = val;
          return;
        }

        var configKey = val.substr(1);

        update();
        $rootScope.$on('init:config', update);
        $rootScope.$on('change:config.' + configKey, update);
        function update() {
          params[key] = config.get(configKey);
        }

      }, {});
    };

    /**
     * Get the value of a param. This value may be a default value.
     *
     * @param  {string} name - the param name to fetch
     * @param  {any} val - the param name to fetch
     * @return {any}
     */
    FieldFormat.prototype.param = function (name) {
      var val = this._params[name];
      if (val || val === false || val === 0) {
        // truthy, false, or 0 are find
        // '', NaN, null, undefined, etc are not
        return val;
      }

      return this._paramDefaults[name];
    };

    FieldFormat.prototype.params = function () {
      return _.cloneDeep(this._params);
    };

    /**
     * Transform a value using the format
     *
     * @param  {any} value
     * @return {string}
     */
    FieldFormat.prototype.convert = function (value) {
      if (!this._convert) throw new Error('You must implement the #convert method in your Field Format');

      if (_.isArray(value)) {
        return angular.toJson(_.map(value, this.convert));
      } else {
        return this._convert(this._escape(value));
      }
    };

    /** Private API */
    FieldFormat.prototype.toJSON = function () {
      return { id: this.type.id, params: this._params };
    };

    FieldFormat.prototype._escape = function (v) {
      return typeof v === 'string' ? _.escape(v) : v;
    };

    return FieldFormat;
  };
});
